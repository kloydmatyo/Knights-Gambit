'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import {
  GameEngine,
  CharacterClass,
  GameState,
  InventoryEngine,
  Item,
  CombatResult,
} from '@/lib/game-engine';
import CharacterSelection from '@/components/game/CharacterSelection';
import HUD from '@/components/game/HUD';
import GameBoard from '@/components/game/GameBoard';
import CombatUI from '@/components/game/CombatUI';
import InventoryPanel from '@/components/game/InventoryPanel';
import ShopPanel from '@/components/game/ShopPanel';
import DiceRoller from '@/components/game/DiceRoller';
import GameOverScreen from '@/components/game/GameOverScreen';
import { motion, AnimatePresence } from 'framer-motion';

type GamePhase = 'character-selection' | 'playing' | 'combat' | 'shop' | 'game-over';

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('character-selection');
  const [lastDiceRoll, setLastDiceRoll] = useState<number | undefined>();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Initialize game with selected character
  const handleCharacterSelect = (characterClass: CharacterClass) => {
    const newGameState = GameEngine.initializeGame(characterClass);
    setGameState(newGameState);
    setPhase('playing');
    showNotification(`Welcome, ${characterClass}! Your adventure begins...`);
  };

  // Roll dice and move player
  const handleDiceRoll = () => {
    if (!gameState) return;

    const { state: newState, diceValue } = GameEngine.rollDice(gameState);
    setLastDiceRoll(diceValue);
    setGameState(newState);

    const tile = newState.board.find((t) => t.id === newState.player.position);
    
    if (tile) {
      switch (tile.type) {
        case 'enemy':
          setPhase('combat');
          const combatState = GameEngine.startCombat(newState);
          setGameState(combatState);
          setCombatLog([`A wild ${tile.enemy?.name} appears!`]);
          break;
        case 'shop':
          setIsShopOpen(true);
          showNotification('Welcome to the shop!');
          break;
        case 'event':
          handleRandomEvent();
          break;
        case 'boss':
          setPhase('combat');
          const bossState = GameEngine.startCombat(newState);
          setGameState(bossState);
          setCombatLog(['Boss battle begins!']);
          break;
        default:
          showNotification(`Moved ${diceValue} spaces!`);
      }
    }

    // Check if floor is complete
    if (GameEngine.isFloorComplete(newState)) {
      handleFloorComplete(newState);
    }
  };

  // Handle combat attack
  const handleAttack = () => {
    if (!gameState || !gameState.currentEnemy) return;

    const { state: newState, result } = GameEngine.executeCombatTurn(gameState);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);

    if (result.isEnemyDefeated) {
      setTimeout(() => {
        setPhase('playing');
        setCombatLog([]);
        showNotification(`Victory! Earned ${result.coinsEarned} coins!`);
      }, 1500);
    }

    // Check if player died
    if (GameEngine.isGameOver(newState)) {
      setTimeout(() => {
        setPhase('game-over');
      }, 1500);
    }
  };

  // Handle skill usage in combat
  const handleUseSkill = (skillId: string) => {
    if (!gameState || !gameState.currentEnemy) return;

    const { state: newState, result } = GameEngine.executeCombatTurn(gameState, skillId);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);

    if (result.isEnemyDefeated) {
      setTimeout(() => {
        setPhase('playing');
        setCombatLog([]);
        showNotification(`Victory! Earned ${result.coinsEarned} coins!`);
      }, 1500);
    }

    if (GameEngine.isGameOver(newState)) {
      setTimeout(() => {
        setPhase('game-over');
      }, 1500);
    }
  };

  // Handle item usage
  const handleUseItem = (itemId: string) => {
    if (!gameState) return;

    const { player: newPlayer, message } = InventoryEngine.useItem(
      gameState.player,
      itemId
    );

    setGameState({
      ...gameState,
      player: newPlayer,
    });

    showNotification(message);
  };

  // Handle shop purchase
  const handlePurchase = (item: Item) => {
    if (!gameState) return;

    const { player: newPlayer, success, message } = InventoryEngine.purchaseItem(
      gameState.player,
      item
    );

    if (success) {
      setGameState({
        ...gameState,
        player: newPlayer,
      });
    }

    showNotification(message);
  };

  // Handle random event
  const handleRandomEvent = () => {
    if (!gameState) return;

    const events = [
      { text: 'You found a treasure chest!', coins: 20 },
      { text: 'A mysterious stranger heals you!', heal: 15 },
      { text: 'You feel stronger!', attack: 2 },
      { text: 'Nothing happens...', },
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    let newPlayer = gameState.player;

    if (event.coins) {
      newPlayer = { ...newPlayer, coins: newPlayer.coins + event.coins };
    }
    if (event.heal) {
      newPlayer = {
        ...newPlayer,
        health: Math.min(newPlayer.maxHealth, newPlayer.health + event.heal),
      };
    }
    if (event.attack) {
      newPlayer = { ...newPlayer, attack: newPlayer.attack + event.attack };
    }

    setGameState({ ...gameState, player: newPlayer });
    showNotification(event.text);
  };

  // Handle floor completion
  const handleFloorComplete = (state: GameState) => {
    showNotification(`Floor ${state.currentFloor} complete! Advancing...`);
    setTimeout(() => {
      const newState = GameEngine.advanceFloor(state);
      setGameState(newState);
      showNotification(`Welcome to Floor ${newState.currentFloor}!`);
    }, 2000);
  };

  // Show notification
  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Restart game
  const handleRestart = () => {
    setGameState(null);
    setPhase('character-selection');
    setLastDiceRoll(undefined);
    setCombatLog([]);
    setNotification(null);
  };

  // Main menu
  const handleMainMenu = () => {
    window.location.href = '/';
  };

  // Debug functions
  const debugAddCoins = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      player: { ...gameState.player, coins: gameState.player.coins + 100 }
    });
    showNotification('Added 100 coins!');
  };

  const debugHealFull = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      player: { 
        ...gameState.player, 
        health: gameState.player.maxHealth,
        mana: gameState.player.maxMana || 0
      }
    });
    showNotification('Fully healed!');
  };

  const debugOpenShop = () => {
    setIsShopOpen(true);
    showNotification('Shop opened!');
  };

  const debugNextFloor = () => {
    if (!gameState) return;
    const newState = GameEngine.advanceFloor(gameState);
    setGameState(newState);
    showNotification(`Advanced to Floor ${newState.currentFloor}!`);
  };

  const debugWinGame = () => {
    if (!gameState) return;
    setGameState({
      ...gameState,
      currentFloor: 10,
      player: { ...gameState.player, position: 19 }
    });
    showNotification('Set to winning position!');
  };

  if (phase === 'character-selection') {
    return <CharacterSelection onSelect={handleCharacterSelect} />;
  }

  if (!gameState) return null;

  return (
    <div className="relative w-full h-screen bg-game-bg overflow-hidden flex flex-col">
      {/* HUD */}
      <HUD
        player={gameState.player}
        floor={gameState.currentFloor}
        turnCount={gameState.turnCount}
        onInventoryClick={() => setIsInventoryOpen(true)}
      />

      {/* Game Board - Centered with safe zones */}
      <div className="flex-1 flex items-center justify-center px-1 sm:px-4 pt-16 sm:pt-16 pb-32 sm:pb-32">
        <div className="w-full h-full max-w-7xl max-h-[650px] sm:max-h-[680px] relative">
          <GameBoard
            tiles={gameState.board}
            currentPosition={gameState.player.position}
          />
        </div>
      </div>

      {/* Dice Roller */}
      {phase === 'playing' && !gameState.isInCombat && (
        <DiceRoller
          onRoll={handleDiceRoll}
          lastRoll={lastDiceRoll}
          disabled={false}
        />
      )}

      {/* Combat UI */}
      <AnimatePresence>
        {phase === 'combat' && gameState.currentEnemy && (
          <CombatUI
            player={gameState.player}
            enemy={gameState.currentEnemy}
            onAttack={handleAttack}
            onUseSkill={handleUseSkill}
            combatLog={combatLog}
            isPlayerTurn={true}
          />
        )}
      </AnimatePresence>

      {/* Inventory Panel */}
      <InventoryPanel
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        player={gameState.player}
        onUseItem={handleUseItem}
      />

      {/* Shop Panel */}
      <ShopPanel
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        player={gameState.player}
        items={InventoryEngine.getShopItems()}
        onPurchase={handlePurchase}
      />

      {/* Game Over Screen */}
      <AnimatePresence>
        {phase === 'game-over' && (
          <GameOverScreen
            isVictory={false}
            floor={gameState.currentFloor}
            turns={gameState.turnCount}
            coinsEarned={gameState.player.coins}
            onRestart={handleRestart}
            onMainMenu={handleMainMenu}
          />
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 px-4 max-w-[90vw]"
          >
            <div className="bg-game-primary border-2 border-game-gold rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-2xl">
              <p className="text-white font-bold text-sm sm:text-base text-center">{notification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Panel Toggle Button */}
      <button
        onClick={() => setShowDebugPanel(!showDebugPanel)}
        className="fixed top-20 right-2 sm:right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg"
      >
        🐛 Debug
      </button>

      {/* Debug Panel */}
      <AnimatePresence>
        {showDebugPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-32 right-2 sm:right-4 z-50 bg-game-primary border-2 border-purple-500 rounded-lg p-4 shadow-2xl max-w-[200px]"
          >
            <h3 className="text-white font-bold mb-3 text-sm">Debug Tools</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={debugAddCoins}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                💰 +100 Coins
              </button>
              <button
                onClick={debugHealFull}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                ❤️ Full Heal
              </button>
              <button
                onClick={debugOpenShop}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                🏪 Open Shop
              </button>
              <button
                onClick={debugNextFloor}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                ⬆️ Next Floor
              </button>
              <button
                onClick={debugWinGame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                🏆 Win Position
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
