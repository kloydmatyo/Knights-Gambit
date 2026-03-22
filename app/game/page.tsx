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
  BoardTile,
  EnemyEngine,
  Enemy,
} from '@/lib/game-engine';
import { ENEMY_TYPES, ENEMY_SPRITES, WEAPON_UPGRADES } from '@/lib/game-engine/constants';
import { WeaponUpgradeEngine } from '@/lib/game-engine/WeaponUpgradeEngine';
import { WeaponUpgradeState } from '@/lib/game-engine/types';
import CharacterSelection from '@/components/game/CharacterSelection';
import HUD from '@/components/game/HUD';
import GameBoard from '@/components/game/GameBoard';
import CombatUI from '@/components/game/CombatUI';
import InventoryPanel from '@/components/game/InventoryPanel';
import ShopPanel from '@/components/game/ShopPanel';
import WeaponUpgradePanel from '@/components/game/WeaponUpgradePanel';
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
  const [isSpecialShopOpen, setIsSpecialShopOpen] = useState(false);
  const [isUpgradePanelOpen, setIsUpgradePanelOpen] = useState(false);
  const [upgradeState, setUpgradeState] = useState<WeaponUpgradeState>(WeaponUpgradeEngine.createInitialState());
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [enemyAnimState, setEnemyAnimState] = useState<'Idle' | 'Hurt' | 'Attack' | 'Death'>('Idle');
  const [playerHurt, setPlayerHurt] = useState(false);
  const [combatEnemy, setCombatEnemy] = useState<Enemy | null>(null);

  // Initialize game with selected character
  const handleCharacterSelect = (characterClass: CharacterClass) => {
    const newGameState = GameEngine.initializeGame(characterClass);
    setGameState(newGameState);
    setUpgradeState(WeaponUpgradeEngine.createInitialState());
    setPhase('playing');
    showNotification(`Welcome, ${characterClass}! Your adventure begins...`);
  };

  // Roll dice and move player
  const handleDiceRoll = () => {
    if (!gameState) return;

    const { state: newState, diceValue, lapped } = GameEngine.rollDice(gameState);
    setLastDiceRoll(diceValue);

    if (lapped) {
      showNotification('🔀 The board has reshuffled — new dangers await!');
      // On non-boss floors, completing a lap advances the floor
      const hasBoss = gameState.board.some((t) => t.type === 'boss');
      if (!hasBoss) {
        // Delay so the reshuffle notification shows first
        setTimeout(() => handleFloorComplete(newState), 1400);
        setGameState(newState);
        return;
      }
    }

    // Delay tile events so the dice result is visible first
    setTimeout(() => {
      // --- Status effect tick (curse, burn, poison) ---
      let stateForEvent = newState;
      const periodicMessages: string[] = [];

      const updatedEffects = stateForEvent.player.statusEffects
        .map((e) => {
          if (e.type === 'cursed') {
            const dmg = e.value || 8;
            stateForEvent = {
              ...stateForEvent,
              player: { ...stateForEvent.player, health: Math.max(0, stateForEvent.player.health - dmg) },
            };
            periodicMessages.push(`💀 Curse drains ${dmg} HP! (${e.duration - 1} turns left)`);
          }
          if (e.type === 'burn') {
            const dmg = e.value || 5;
            stateForEvent = {
              ...stateForEvent,
              player: { ...stateForEvent.player, health: Math.max(0, stateForEvent.player.health - dmg) },
            };
            periodicMessages.push(`🔥 Burn deals ${dmg} damage! (${e.duration - 1} turns left)`);
          }
          if (e.type === 'poison') {
            const dmg = e.value || 6;
            stateForEvent = {
              ...stateForEvent,
              player: { ...stateForEvent.player, health: Math.max(0, stateForEvent.player.health - dmg) },
            };
            periodicMessages.push(`🧪 Poison deals ${dmg} damage! (${e.duration - 1} turns left)`);
          }
          return { ...e, duration: e.duration - 1 };
        })
        .filter((e) => e.duration > 0);

      stateForEvent = {
        ...stateForEvent,
        player: { ...stateForEvent.player, statusEffects: updatedEffects },
      };

      if (periodicMessages.length > 0) {
        showNotification(periodicMessages.join(' | '));
      }

      // Check death from status effects before processing tile
      if (stateForEvent.player.health <= 0) {
        setGameState(stateForEvent);
        setTimeout(() => setPhase('game-over'), 500);
        return;
      }

      // --- Tile event ---
      const tile = stateForEvent.board.find((t) => t.id === stateForEvent.player.position);

      if (tile) {
        switch (tile.type) {
          case 'enemy': {
            const combatState = GameEngine.startCombat(stateForEvent);
            setGameState(combatState);
            setPhase('combat');
            setCombatEnemy(combatState.currentEnemy);
            setCombatLog([`A wild ${tile.enemy?.name} appears!`]);
            return; // floor-complete check happens after combat ends
          }
          case 'shop':
            setGameState(stateForEvent);
            setIsShopOpen(true);
            showNotification('Welcome to the shop!');
            break;
          case 'event':
            // handleRandomEvent reads from gameState so sync first
            setGameState(stateForEvent);
            handleRandomEventWith(stateForEvent);
            return;
          case 'trap':
            if (!tile.trapTriggered) {
              handleTrapTrigger(stateForEvent, tile);
            } else {
              setGameState(stateForEvent);
              showNotification('An old disarmed trap... you pass safely.');
            }
            return;
          case 'boss': {
            const bossState = GameEngine.startCombat(stateForEvent);
            setGameState(bossState);
            setPhase('combat');
            setCombatEnemy(bossState.currentEnemy);
            setCombatLog(['⚠️ Boss battle begins!']);
            return;
          }
          default:
            setGameState(stateForEvent);
            showNotification(`Moved ${diceValue} spaces!`);
        }
      } else {
        setGameState(stateForEvent);
      }

      // --- Floor completion check (non-combat tiles only) ---
      if (GameEngine.isFloorComplete(stateForEvent)) {
        handleFloorComplete(stateForEvent);
      }
    }, 1200);
  };

  // Single source of truth for all combat animation sequencing
  const triggerCombatAnimations = (enemyType: string, result: { playerDamage: number; enemyDamage: number; isEnemyDefeated: boolean; coinsEarned: number }) => {
    const hurtFrames = ENEMY_SPRITES[enemyType]?.frames['Hurt'] ?? 3;
    const hurtDuration = (hurtFrames / 8) * 1000;
    const attackFrames = ENEMY_SPRITES[enemyType]?.frames['Attack'] ?? 3;
    const attackDuration = (attackFrames / 8) * 1000;
    const reactionGap = 200;

    // Step 1: enemy hurt
    if (result.playerDamage > 0) {
      setEnemyAnimState('Hurt');
    }

    if (result.isEnemyDefeated) {
      // Hurt → Death, freeze HP at 0
      setCombatEnemy(prev => prev ? { ...prev, health: 0 } : prev);
      setTimeout(() => setEnemyAnimState('Death'), hurtDuration + reactionGap);
      setTimeout(() => {
        setEnemyAnimState('Idle');
        setPhase('playing');
        setCombatLog([]);
        setCombatEnemy(null);
        showNotification(`Victory! Earned ${result.coinsEarned} coins!`);
        // Check floor completion after combat ends
        setGameState((prev) => {
          if (!prev) return prev;
          if (GameEngine.isFloorComplete(prev)) {
            setTimeout(() => handleFloorComplete(prev), 500);
          }
          return prev;
        });
      }, hurtDuration + reactionGap + 5000);
      return;
    }

    // Step 2: after hurt, enemy attacks
    const attackStart = (result.playerDamage > 0 ? hurtDuration : 0) + reactionGap;
    if (result.enemyDamage > 0) {
      setTimeout(() => setEnemyAnimState('Attack'), attackStart);

      // Step 3: player hurt flash during enemy attack
      setTimeout(() => setPlayerHurt(true), attackStart + attackDuration * 0.5);
      setTimeout(() => setPlayerHurt(false), attackStart + attackDuration * 0.5 + 400);

      // Step 4: back to idle
      setTimeout(() => setEnemyAnimState('Idle'), attackStart + attackDuration);
    } else {
      // No counter-attack, just return to idle after hurt
      setTimeout(() => setEnemyAnimState('Idle'), attackStart);
    }
  };

  // Handle combat attack
  const handleAttack = () => {
    if (!gameState || !gameState.currentEnemy) return;

    const { state: newState, result } = GameEngine.executeCombatTurn(gameState);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);
    triggerCombatAnimations(gameState.currentEnemy.type, result);

    if (GameEngine.isGameOver(newState)) {
      setTimeout(() => setPhase('game-over'), 1500);
    }
  };

  // Handle skill usage in combat
  const handleUseSkill = (skillId: string) => {
    if (!gameState || !gameState.currentEnemy) return;

    const { state: newState, result } = GameEngine.executeCombatTurn(gameState, skillId);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);
    triggerCombatAnimations(gameState.currentEnemy.type, result);

    if (GameEngine.isGameOver(newState)) {
      setTimeout(() => setPhase('game-over'), 1500);
    }
  };

  // Handle item usage
  const handleUseItem = (itemId: string) => {
    if (!gameState) return;

    // eslint-disable-next-line react-hooks/rules-of-hooks
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

  // Handle trap trigger
  const handleTrapTrigger = (state: GameState, tile: BoardTile) => {
    let newPlayer = state.player;
    let message = '';

    // Deactivate the trap on the board
    const newBoard = state.board.map((t) =>
      t.id === tile.id ? { ...t, trapTriggered: true } : t
    );

    switch (tile.trapType) {
      case 'fire':
        // Apply burn debuff (refresh if already burning)
        const alreadyBurning = newPlayer.statusEffects.some((e) => e.type === 'burn');
        newPlayer = {
          ...newPlayer,
          statusEffects: alreadyBurning
            ? newPlayer.statusEffects.map((e) =>
                e.type === 'burn' ? { ...e, duration: Math.max(e.duration, 4) } : e
              )
            : [...newPlayer.statusEffects, { type: 'burn' as const, duration: 4, value: 5 }],
        };
        message = '🔥 Fire Trap! You are set ablaze! Burn for 4 turns.';
        break;
      case 'spike':
        // Direct damage
        const spikeDmg = 15;
        newPlayer = { ...newPlayer, health: Math.max(0, newPlayer.health - spikeDmg) };
        message = `🗡️ Spike Trap! You take ${spikeDmg} direct damage!`;
        break;
      case 'poison_gas':
        // Apply poison
        const alreadyPoisoned = newPlayer.statusEffects.some((e) => e.type === 'poison');
        newPlayer = {
          ...newPlayer,
          statusEffects: alreadyPoisoned
            ? newPlayer.statusEffects.map((e) =>
                e.type === 'poison' ? { ...e, duration: Math.max(e.duration, 3) } : e
              )
            : [...newPlayer.statusEffects, { type: 'poison' as const, duration: 3, value: 6 }],
        };
        message = '🧪 Poison Gas Trap! You inhale toxic fumes! Poisoned for 3 turns.';
        break;
      default:
        message = '⚠️ You triggered a trap!';
    }

    setGameState({ ...state, player: newPlayer, board: newBoard });
    showNotification(message);

    if (newPlayer.health <= 0) {
      setTimeout(() => setPhase('game-over'), 500);
    }
  };

  // Handle random event (accepts explicit state to avoid stale closure)
  const handleRandomEventWith = (state: GameState) => {
    const events = [
      { text: 'You found a treasure chest!', coins: 20 },
      { text: 'A mysterious stranger heals you!', heal: 15 },
      { text: 'You feel stronger!', attack: 2 },
      { text: 'A dark spirit curses you!', curse: true },
      { text: 'A fire spirit scorches you!', burn: true },
      { text: 'Nothing happens...' },
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    let newPlayer = state.player;

    if (event.coins) newPlayer = { ...newPlayer, coins: newPlayer.coins + event.coins };
    if (event.heal) newPlayer = { ...newPlayer, health: Math.min(newPlayer.maxHealth, newPlayer.health + event.heal) };
    if (event.attack) newPlayer = { ...newPlayer, attack: newPlayer.attack + event.attack };
    if (event.curse) {
      const alreadyCursed = newPlayer.statusEffects.some((e) => e.type === 'cursed');
      if (!alreadyCursed) {
        newPlayer = { ...newPlayer, statusEffects: [...newPlayer.statusEffects, { type: 'cursed' as const, duration: 5, value: 8 }] };
      }
    }
    if ((event as any).burn) {
      const alreadyBurning = newPlayer.statusEffects.some((e) => e.type === 'burn');
      newPlayer = {
        ...newPlayer,
        statusEffects: alreadyBurning
          ? newPlayer.statusEffects.map((e) => e.type === 'burn' ? { ...e, duration: Math.max(e.duration, 3) } : e)
          : [...newPlayer.statusEffects, { type: 'burn' as const, duration: 3, value: 5 }],
      };
    }

    const newState = { ...state, player: newPlayer };
    setGameState(newState);
    showNotification(event.text);

    if (GameEngine.isFloorComplete(newState)) {
      handleFloorComplete(newState);
    }
  };

  // Handle random event
  const handleRandomEvent = () => {
    if (!gameState) return;
    handleRandomEventWith(gameState);
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

  // Handle weapon upgrade purchase
  const handleWeaponUpgradePurchase = (upgradeId: string): { success: boolean; message: string } => {
    if (!gameState) return { success: false, message: 'No game state.' };
    const outcome = WeaponUpgradeEngine.purchaseUpgrade(
      gameState.player.class,
      gameState.player.coins,
      upgradeId,
      gameState.currentFloor,
      upgradeState
    );
    if (!outcome) return { success: false, message: 'Cannot purchase this upgrade.' };
    setUpgradeState(outcome.upgradeState);
    setGameState({
      ...gameState,
      player: {
        ...gameState.player,
        coins: outcome.coins,
        attack: gameState.player.attack + outcome.attackDelta,
        defense: gameState.player.defense + outcome.defenseDelta,
        maxHealth: gameState.player.maxHealth + outcome.healthDelta,
        health: Math.min(gameState.player.health + outcome.healthDelta, gameState.player.maxHealth + outcome.healthDelta),
      },
    });
    showNotification(outcome.message);
    return { success: true, message: outcome.message };
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

  const debugFightEnemy = (type: string) => {
    if (!gameState) return;
    const enemy = EnemyEngine.createEnemy(type as any, gameState.currentFloor);
    const newState: GameState = {
      ...gameState,
      isInCombat: true,
      currentEnemy: enemy,
    };
    setGameState(newState);
    setPhase('combat');
    setCombatEnemy(enemy);
    setCombatLog([`[DEBUG] A wild ${enemy.name} appears!`]);
  };

  const debugUnlockAllUpgrades = () => {
    if (!gameState) return;
    const classUpgrades = WeaponUpgradeEngine.getClassUpgrades(gameState.player.class);
    let currentState = upgradeState;
    let player = gameState.player;
    // Force-apply all upgrades for this class regardless of cost/floor/prereqs
    for (const upgrade of classUpgrades) {
      if (currentState.purchasedUpgradeIds.includes(upgrade.id)) continue;
      const { effect } = upgrade;
      currentState = {
        purchasedUpgradeIds: [...currentState.purchasedUpgradeIds, upgrade.id],
        totalAttackBonus: currentState.totalAttackBonus + (effect.attackBonus ?? 0),
        totalDefenseBonus: currentState.totalDefenseBonus + (effect.defenseBonus ?? 0),
        totalCritChanceBonus: currentState.totalCritChanceBonus + (effect.critChanceBonus ?? 0),
        totalCritDamageBonus: currentState.totalCritDamageBonus + (effect.critDamageBonus ?? 0),
        totalHealthBonus: currentState.totalHealthBonus + (effect.healthBonus ?? 0),
        unlockedAbilities: effect.specialAbility
          ? [...currentState.unlockedAbilities, effect.specialAbility]
          : currentState.unlockedAbilities,
      };
      player = {
        ...player,
        attack: player.attack + (effect.attackBonus ?? 0),
        defense: player.defense + (effect.defenseBonus ?? 0),
        maxHealth: player.maxHealth + (effect.healthBonus ?? 0),
        health: Math.min(player.health + (effect.healthBonus ?? 0), player.maxHealth + (effect.healthBonus ?? 0)),
      };
    }
    setUpgradeState(currentState);
    setGameState({ ...gameState, player });
    showNotification(`[DEBUG] All ${gameState.player.class} upgrades unlocked!`);
  };

  const debugResetUpgrades = () => {
    if (!gameState) return;
    const purchased = WeaponUpgradeEngine.getPurchasedUpgrades(upgradeState);
    let player = gameState.player;
    for (const upgrade of purchased) {
      const { effect } = upgrade;
      player = {
        ...player,
        attack: player.attack - (effect.attackBonus ?? 0),
        defense: player.defense - (effect.defenseBonus ?? 0),
        maxHealth: player.maxHealth - (effect.healthBonus ?? 0),
        health: Math.min(player.health, player.maxHealth - (effect.healthBonus ?? 0)),
      };
    }
    setUpgradeState(WeaponUpgradeEngine.createInitialState());
    setGameState({ ...gameState, player });
    showNotification('[DEBUG] All weapon upgrades reset.');
  };

  const debugSetFloor = (floor: number) => {
    if (!gameState) return;
    setGameState({ ...gameState, currentFloor: floor });
    showNotification(`[DEBUG] Floor set to ${floor}`);
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
        {phase === 'combat' && combatEnemy && (
          <CombatUI
            player={gameState.player}
            enemy={gameState.currentEnemy ?? combatEnemy!}
            onAttack={handleAttack}
            onUseSkill={handleUseSkill}
            combatLog={combatLog}
            isPlayerTurn={true}
            enemyAnimState={enemyAnimState}
            playerHurt={playerHurt}
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

      {/* Special Shop Panel */}
      <ShopPanel
        isOpen={isSpecialShopOpen}
        onClose={() => setIsSpecialShopOpen(false)}
        player={gameState.player}
        items={InventoryEngine.getSpecialShopItems()}
        onPurchase={handlePurchase}
        title="✨ Special Shop"
      />

      {/* Weapon Upgrade Panel */}
      <WeaponUpgradePanel
        isOpen={isUpgradePanelOpen}
        onClose={() => setIsUpgradePanelOpen(false)}
        player={gameState.player}
        currentFloor={gameState.currentFloor}
        upgradeState={upgradeState}
        onPurchase={handleWeaponUpgradePurchase}
      />

      {/* Game Over Screen */}
      <AnimatePresence>
        {phase === 'game-over' && (
          <GameOverScreen
            isVictory={false}
            floor={gameState.currentFloor}
            turns={gameState.turnCount}
            coinsEarned={gameState.player.coins}
            characterClass={gameState.player.class}
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
                onClick={() => setIsSpecialShopOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                ✨ Special Shop
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
              <div className="border-t border-purple-400 pt-2 mt-1">
                <p className="text-purple-300 text-xs mb-2 font-bold">⚔️ Fight Enemy</p>
                {Object.entries(ENEMY_TYPES).map(([key, type]) => (
                  <button
                    key={type}
                    onClick={() => debugFightEnemy(type)}
                    className="w-full bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  >
                    {type.replace(/(\d)/, ' $1').replace(/^./, s => s.toUpperCase())}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRandomEvent}
                className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                ✨ Trigger Event
              </button>
              <div className="border-t border-purple-400 pt-2 mt-1">
                <p className="text-purple-300 text-xs mb-2 font-bold">⚔️ Weapon Upgrades</p>
                <button
                  onClick={() => setIsUpgradePanelOpen(true)}
                  className="w-full bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                >
                  🔧 Open Upgrades
                </button>
                <button
                  onClick={debugUnlockAllUpgrades}
                  className="w-full bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                >
                  🔓 Unlock All
                </button>
                <button
                  onClick={debugResetUpgrades}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                >
                  🔄 Reset Upgrades
                </button>
                <p className="text-purple-300 text-xs mb-1 mt-2 font-bold">Set Floor</p>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 3, 6, 9].map((f) => (
                    <button
                      key={f}
                      onClick={() => debugSetFloor(f)}
                      className="bg-teal-700 hover:bg-teal-600 text-white px-2 py-1 rounded text-xs font-bold"
                    >
                      F{f}
                    </button>
                  ))}
                </div>
                {upgradeState.purchasedUpgradeIds.length > 0 && (
                  <p className="text-green-400 text-xs mt-2">
                    ✅ {upgradeState.purchasedUpgradeIds.length} upgrade{upgradeState.purchasedUpgradeIds.length !== 1 ? 's' : ''} owned
                  </p>
                )}
              </div>              <button
                onClick={() => {
                  if (!gameState) return;
                  const trapTypes = ['fire', 'spike', 'poison_gas'] as const;
                  const randomTrap = trapTypes[Math.floor(Math.random() * trapTypes.length)];
                  const fakeTile = { id: gameState.player.position, type: 'trap' as const, x: 0, y: 0, visited: true, trapType: randomTrap, trapTriggered: false };
                  handleTrapTrigger(gameState, fakeTile);
                }}
                className="bg-red-700 hover:bg-red-800 text-white px-3 py-2 rounded text-xs font-bold"
              >
                🎲 Random Trap
              </button>
              <button
                onClick={() => {
                  if (!gameState) return;
                  handleTrapTrigger(gameState, { id: gameState.player.position, type: 'trap', x: 0, y: 0, visited: true, trapType: 'fire', trapTriggered: false });
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                🔥 Fire Trap
              </button>
              <button
                onClick={() => {
                  if (!gameState) return;
                  handleTrapTrigger(gameState, { id: gameState.player.position, type: 'trap', x: 0, y: 0, visited: true, trapType: 'spike', trapTriggered: false });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-xs font-bold"
              >
                🗡️ Spike Trap
              </button>
              <button
                onClick={() => {
                  if (!gameState) return;
                  handleTrapTrigger(gameState, { id: gameState.player.position, type: 'trap', x: 0, y: 0, visited: true, trapType: 'poison_gas', trapTriggered: false });
                }}
                className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded text-xs font-bold"
              >
                🧪 Poison Trap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
