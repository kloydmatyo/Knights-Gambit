'use client';

import { useState, useEffect } from 'react';
import {
  GameEngine,
  CharacterClass,
  GameState,
  InventoryEngine,
  Item,
  BoardTile,
  EnemyEngine,
  Enemy,
  CombatEngine,
  getStatUpgradeItems,
  incrementStatCount,
} from '@/lib/game-engine';
import { BranchChoice } from '@/lib/game-engine/types';
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
import DiceManipulator from '@/components/game/DiceManipulator';
import GameOverScreen from '@/components/game/GameOverScreen';
import DungeonClearScreen from '@/components/game/DungeonClearScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { getDungeonNumber, isDungeonBossFloor } from '@/lib/game-engine/constants';
import { SaveEngine, SaveData } from '@/lib/game-engine/SaveEngine';
import { onFlee, onBribe, onTruce, checkEventPayoff, consumePayoff } from '@/lib/game-engine/FlagEngine';
import ResumePrompt from '@/components/game/ResumePrompt';

type GamePhase = 'character-selection' | 'playing' | 'combat' | 'shop' | 'game-over' | 'dungeon-clear' | 'resume-prompt';

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
  const [fleeUsed, setFleeUsed] = useState(false);
  // Branch choice state â€” set after rolling, cleared after tile selection
  const [pendingChoice, setPendingChoice] = useState<BranchChoice | null>(null);
  const [playerName, setPlayerName] = useState<string>('');
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [savedRuns, setSavedRuns] = useState<SaveData[]>([]);
  const [pendingFloorAdvance, setPendingFloorAdvance] = useState<GameState | null>(null);
  const [floorCompleteState, setFloorCompleteState] = useState<GameState | null>(null);

  // Detect saved runs on mount
  useEffect(() => {
    const saves = SaveEngine.loadAll();
    if (saves.length > 0) { setSavedRuns(saves); setPhase('resume-prompt'); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // -- Auto-save helper (pass name explicitly to avoid stale closure) --
  const autoSave = (gs: GameState, name: string = playerName, us: WeaponUpgradeState = upgradeState) => {
    if (name) SaveEngine.save(activeSlot, name, gs, us);
  };

  // â”€â”€ Character selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleCharacterSelect = (characterClass: CharacterClass, name: string, spriteDataUrl?: string) => {
    const newGameState = GameEngine.initializeGame(characterClass);
    const newUpgradeState = WeaponUpgradeEngine.createInitialState();
    if (spriteDataUrl) {
      (newGameState.player as any).spriteDataUrl = spriteDataUrl;
    }
    setPlayerName(name);
    setGameState(newGameState);
    setUpgradeState(newUpgradeState);
    setPhase('playing');
    SaveEngine.save(activeSlot, name, newGameState, newUpgradeState);
    showNotification(`Welcome, ${name}! Your adventure begins...`);
  };

  // -- Dice roll -- NEW FLOW: show branch options first, no dice yet ----------
  const handleDiceRoll = () => {
    if (!gameState || pendingChoice) return;
    const { state: newState, branchChoice } = GameEngine.getBranchOptions(gameState);
    setGameState(newState);
    setPendingChoice(branchChoice);
  };

  // -- Tile chosen -- roll 2d6 for destiny, show result before resolving ------
  const handleTileChosen = (tileId: number) => {
    if (!gameState) return;

    // If destiny already rolled for this tile, resolve the node
    if (pendingChoice?.chosenTileId === tileId && pendingChoice?.destinyResult) {
      resolveNode(tileId);
      return;
    }

    // Player just picked a tile -- roll 2d6 and show destiny
    const { state: newState, destinyResult } = GameEngine.rollOutcome(gameState, tileId);
    setLastDiceRoll(destinyResult.total);
    setGameState(newState);
    setPendingChoice(newState.pendingBranchChoice ?? null);
  };

  // -- Confirm destiny -- called when player clicks "Proceed" after seeing 2d6 -
  const handleConfirmDestiny = () => {
    if (!gameState || !pendingChoice?.chosenTileId) return;
    resolveNode(pendingChoice.chosenTileId);
  };

  // -- Resolve node -- move player and trigger tile event ----------------------
  const resolveNode = (tileId: number) => {
    if (!gameState) return;
    const destiny = gameState.pendingBranchChoice?.destinyResult;
    setPendingChoice(null);

    // Move player to chosen tile (destiny modifier applied inside chooseTile)
    let stateAfterMove = GameEngine.chooseTile(gameState, tileId);

    // Apply destiny buffs/debuffs to player for non-combat nodes
    if (destiny) {
      const tile = stateAfterMove.board.find((t) => t.id === tileId);
      if (tile && tile.type !== 'enemy' && tile.type !== 'elite' && tile.type !== 'boss') {
        if (destiny.state === 'favored') {
          // +15% max HP heal + +2 ATK for this floor
          const bonus = Math.floor(stateAfterMove.player.maxHealth * 0.15);
          stateAfterMove = { ...stateAfterMove, player: {
            ...stateAfterMove.player,
            health: Math.min(stateAfterMove.player.maxHealth, stateAfterMove.player.health + bonus),
            attack: stateAfterMove.player.attack + 2,
          }};
          showNotification(`📈 Favored! +${bonus} HP, +2 ATK this floor`);
        } else if (destiny.state === 'exalted') {
          // +25% max HP heal + +5 ATK + +10 coins
          const bonus = Math.floor(stateAfterMove.player.maxHealth * 0.25);
          stateAfterMove = { ...stateAfterMove, player: {
            ...stateAfterMove.player,
            health: Math.min(stateAfterMove.player.maxHealth, stateAfterMove.player.health + bonus),
            attack: stateAfterMove.player.attack + 5,
            coins: stateAfterMove.player.coins + 10,
          }};
          showNotification(`✨ Exalted! +${bonus} HP, +5 ATK, +10 coins`);
        } else if (destiny.state === 'cursed') {
          // -20% max HP + apply cursed status effect
          const dmg = Math.floor(stateAfterMove.player.maxHealth * 0.2);
          const alreadyCursed = stateAfterMove.player.statusEffects.some(e => e.type === 'cursed');
          stateAfterMove = { ...stateAfterMove, player: {
            ...stateAfterMove.player,
            health: Math.max(1, stateAfterMove.player.health - dmg),
            statusEffects: alreadyCursed
              ? stateAfterMove.player.statusEffects
              : [...stateAfterMove.player.statusEffects, { type: 'cursed' as const, duration: 3, value: 10 }],
          }};
          showNotification(`💀 Cursed! -${dmg} HP + Cursed for 3 turns`);
        } else if (destiny.state === 'unlucky') {
          // -10% max HP + -2 ATK temporarily (apply as a small debuff via notification)
          const dmg = Math.floor(stateAfterMove.player.maxHealth * 0.1);
          stateAfterMove = { ...stateAfterMove, player: {
            ...stateAfterMove.player,
            health: Math.max(1, stateAfterMove.player.health - dmg),
          }};
          showNotification(`📉 Unlucky! -${dmg} HP`);
        }
      }
    }

    // Status effect tick
    const periodicMessages: string[] = [];
    const updatedEffects = stateAfterMove.player.statusEffects
      .map((e) => {
        if (e.type === 'cursed') {
          const dmg = e.value || 8;
          stateAfterMove = { ...stateAfterMove, player: { ...stateAfterMove.player, health: Math.max(0, stateAfterMove.player.health - dmg) } };
          periodicMessages.push(`Curse drains ${dmg} HP! (${e.duration - 1} turns left)`);
        }
        if (e.type === 'burn') {
          const dmg = e.value || 5;
          stateAfterMove = { ...stateAfterMove, player: { ...stateAfterMove.player, health: Math.max(0, stateAfterMove.player.health - dmg) } };
          periodicMessages.push(`Burn deals ${dmg} damage! (${e.duration - 1} turns left)`);
        }
        if (e.type === 'poison') {
          const dmg = e.value || 6;
          stateAfterMove = { ...stateAfterMove, player: { ...stateAfterMove.player, health: Math.max(0, stateAfterMove.player.health - dmg) } };
          periodicMessages.push(`Poison deals ${dmg} damage! (${e.duration - 1} turns left)`);
        }
        return { ...e, duration: e.duration - 1 };
      })
      .filter((e) => e.duration > 0);

    stateAfterMove = { ...stateAfterMove, player: { ...stateAfterMove.player, statusEffects: updatedEffects } };
    if (periodicMessages.length > 0) showNotification(periodicMessages.join(' | '));

    if (stateAfterMove.player.health <= 0) {
      setGameState(stateAfterMove);
      SaveEngine.clearSlot(activeSlot);
      setTimeout(() => setPhase('game-over'), 500);
      return;
    }

    // Tile event
    const tile = stateAfterMove.board.find((t) => t.id === tileId);
    if (!tile) { setGameState(stateAfterMove); return; }

    // Exalted on combat = instant win (enemy HP already set to 0 in chooseTile)
    const isInstantWin = false; // removed: exalted now doubles damage in combat instead

    switch (tile.type) {
      case 'enemy': {
        const combatState = GameEngine.startCombat(stateAfterMove);
        setGameState(combatState);
        setPhase('combat');
        setCombatEnemy(combatState.currentEnemy);
        setFleeUsed(false);
        const destinyTag = destiny ? ` [${destiny.emoji} ${destiny.label}]` : '';
        setCombatLog([`A wild ${tile.enemy?.name} appears!${destinyTag}`]);
        return;
      }
      case 'elite': {
        const combatState = GameEngine.startCombat(stateAfterMove);
        setGameState(combatState);
        setPhase('combat');
        setCombatEnemy(combatState.currentEnemy);
        setFleeUsed(false);
        const destinyTag = destiny ? ` [${destiny.emoji} ${destiny.label}]` : '';
        setCombatLog([`⚔️ Elite ${tile.enemy?.name} blocks your path!${destinyTag}`]);
        return;
      }
      case 'boss': {
        const bossState = GameEngine.startCombat(stateAfterMove);
        setGameState(bossState);
        setPhase('combat');
        setCombatEnemy(bossState.currentEnemy);
        setFleeUsed(false);
        const destinyTag = destiny ? ` [${destiny.emoji} ${destiny.label}]` : '';
        setCombatLog([` Boss battle begins!${destinyTag}`]);
        return;
      }
      case 'shop': {
        // Exalted = free shop, Cursed = 3x prices (handled in ShopPanel via destinyState prop)
        setGameState(stateAfterMove);
        const shopMsg = destiny?.state === 'exalted' ? ' Exalted! Everything is FREE!'
          : destiny?.state === 'cursed' ? ' Cursed! Prices are tripled!'
          : destiny?.state === 'favored' ? ' Favored! 25% discount!'
          : ' Welcome to the shop!';
        showNotification(shopMsg);
        // Only auto-open shop if this isn't the final tile — otherwise let the buttons handle it
        if (!GameEngine.isFloorComplete(stateAfterMove)) {
          setIsShopOpen(true);
        }
        break;
      }
      case 'event':
        handleRandomEventWith(stateAfterMove, destiny);
        return;
      case 'trap':
        if (!tile.trapTriggered) {
          handleTrapTrigger(stateAfterMove, tile);
        } else {
          setGameState(stateAfterMove);
          showNotification('An old disarmed trap... you pass safely.');
        }
        return;
      default:
        setGameState(stateAfterMove);
    }

    if (GameEngine.isFloorComplete(stateAfterMove)) {
      handleFloorComplete(stateAfterMove);
    }
  };

  // â”€â”€ Combat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const triggerCombatAnimations = (enemyType: string, result: { playerDamage: number; enemyDamage: number; isEnemyDefeated: boolean; coinsEarned: number }) => {
    const hurtFrames = ENEMY_SPRITES[enemyType]?.frames['Hurt'] ?? 3;
    const hurtDuration = (hurtFrames / 8) * 1000;
    const attackFrames = ENEMY_SPRITES[enemyType]?.frames['Attack'] ?? 3;
    const attackDuration = (attackFrames / 8) * 1000;
    const reactionGap = 200;

    if (result.playerDamage > 0) setEnemyAnimState('Hurt');

    if (result.isEnemyDefeated) {
      setCombatEnemy(prev => prev ? { ...prev, health: 0 } : prev);
      setTimeout(() => setEnemyAnimState('Death'), hurtDuration + reactionGap);
      setTimeout(() => {
        setEnemyAnimState('Idle');
        setPhase('playing');
        setCombatLog([]);
        setCombatEnemy(null);
        showNotification(`Victory! Earned ${result.coinsEarned} coins!`);
        setGameState((prev) => {
          if (!prev) return prev;
          if (GameEngine.isFloorComplete(prev)) setTimeout(() => handleFloorComplete(prev), 500);
          return prev;
        });
      }, hurtDuration + reactionGap + 5000);
      return;
    }

    const attackStart = (result.playerDamage > 0 ? hurtDuration : 0) + reactionGap;
    if (result.enemyDamage > 0) {
      setTimeout(() => setEnemyAnimState('Attack'), attackStart);
      setTimeout(() => setPlayerHurt(true), attackStart + attackDuration * 0.5);
      setTimeout(() => setPlayerHurt(false), attackStart + attackDuration * 0.5 + 400);
      setTimeout(() => setEnemyAnimState('Idle'), attackStart + attackDuration);
    } else {
      setTimeout(() => setEnemyAnimState('Idle'), attackStart);
    }
  };

  const handleAttack = () => {
    if (!gameState || !gameState.currentEnemy) return;
    const { state: newState, result } = GameEngine.executeCombatTurn(gameState, undefined, upgradeState);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);
    triggerCombatAnimations(gameState.currentEnemy.type, result);
    if (GameEngine.isGameOver(newState)) { SaveEngine.clearSlot(activeSlot); setTimeout(() => setPhase('game-over'), 1500); }
    else autoSave(newState);
  };

  const handleUseSkill = (skillId: string) => {
    if (!gameState || !gameState.currentEnemy) return;
    const { state: newState, result } = GameEngine.executeCombatTurn(gameState, skillId, upgradeState);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);
    triggerCombatAnimations(gameState.currentEnemy.type, result);
    if (GameEngine.isGameOver(newState)) { SaveEngine.clearSlot(activeSlot); setTimeout(() => setPhase('game-over'), 1500); }
    else autoSave(newState);
  };

  const handleFlee = () => {
    if (!gameState || !gameState.currentEnemy) return;
    const enemy = gameState.currentEnemy;
    const { state: newState, result } = GameEngine.executeFleeAttempt(gameState);
    setFleeUsed(true);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);

    if (result.isPlayerVictory) {
      const flaggedState = onFlee(newState, enemy);
      setGameState(flaggedState);
      setPhase('playing');
      setCombatLog([]);
      setCombatEnemy(null);
      showNotification('🏃 You fled successfully!');
    } else {
      showNotification('🏃 Flee failed!');
      if (GameEngine.isGameOver(newState)) { SaveEngine.clearSlot(activeSlot); setTimeout(() => setPhase('game-over'), 1000); }
    }
  };

  const handleBribe = () => {
    if (!gameState || !gameState.currentEnemy) return;
    const enemy = gameState.currentEnemy;
    const { state: newState, result } = GameEngine.executeBribeAttempt(gameState);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);

    if (result.isPlayerVictory) {
      const flaggedState = onBribe(newState, enemy);
      setGameState(flaggedState);
      setPhase('playing');
      setCombatLog([]);
      setCombatEnemy(null);
      showNotification(`💰 Bribe accepted! Paid ${result.bribeCost} coins.`);
    } else {
      showNotification('💰 Bribe failed!');
      if (GameEngine.isGameOver(newState)) { SaveEngine.clearSlot(activeSlot); setTimeout(() => setPhase('game-over'), 1000); }
    }
  };

  const handleTruce = () => {
    if (!gameState || !gameState.currentEnemy) return;
    const enemy = gameState.currentEnemy;
    const { state: newState, result } = GameEngine.executeTruceAttempt(gameState);
    setGameState(newState);
    setCombatLog((prev) => [...prev, ...result.messages]);

    if (result.isPlayerVictory) {
      const flaggedState = onTruce(newState, enemy);
      setGameState(flaggedState);
      setPhase('playing');
      setCombatLog([]);
      setCombatEnemy(null);
      showNotification(`🤝 Truce! Earned ${result.coinsEarned} coins.`);
    } else {
      showNotification('🤝 Truce rejected!');
      if (GameEngine.isGameOver(newState)) { SaveEngine.clearSlot(activeSlot); setTimeout(() => setPhase('game-over'), 1000); }
    }
  };

  // â”€â”€ Items / Shop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleUseItem = (itemId: string) => {
    if (!gameState) return;
    const { player: newPlayer, message } = InventoryEngine.useItem(gameState.player, itemId);
    setGameState({ ...gameState, player: newPlayer });
    showNotification(message);
  };

  const handlePurchase = (item: Item) => {
    if (!gameState) return;
    const { player: newPlayer, success, message } = InventoryEngine.purchaseItem(gameState.player, item);
    if (success) {
      const newCounts = item.effect.type === 'permanent' && item.effect.stat
        ? incrementStatCount(gameState.statUpgradeCounts, item.effect.stat)
        : gameState.statUpgradeCounts;
      setGameState({ ...gameState, player: newPlayer, statUpgradeCounts: newCounts });
    }
    showNotification(message);
  };

  // â”€â”€ Traps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleTrapTrigger = (state: GameState, tile: BoardTile) => {
    let newPlayer = state.player;
    let message = '';
    const newBoard = state.board.map((t) => t.id === tile.id ? { ...t, trapTriggered: true } : t);

    switch (tile.trapType) {
      case 'fire': {
        const already = newPlayer.statusEffects.some((e) => e.type === 'burn');
        newPlayer = { ...newPlayer, statusEffects: already
          ? newPlayer.statusEffects.map((e) => e.type === 'burn' ? { ...e, duration: Math.max(e.duration, 4) } : e)
          : [...newPlayer.statusEffects, { type: 'burn' as const, duration: 4, value: 5 }] };
        message = 'ðŸ”¥ Fire Trap! You are set ablaze! Burn for 4 turns.';
        break;
      }
      case 'spike': {
        const dmg = 15;
        newPlayer = { ...newPlayer, health: Math.max(0, newPlayer.health - dmg) };
        message = `ðŸ—¡ï¸ Spike Trap! You take ${dmg} direct damage!`;
        break;
      }
      case 'poison_gas': {
        const already = newPlayer.statusEffects.some((e) => e.type === 'poison');
        newPlayer = { ...newPlayer, statusEffects: already
          ? newPlayer.statusEffects.map((e) => e.type === 'poison' ? { ...e, duration: Math.max(e.duration, 3) } : e)
          : [...newPlayer.statusEffects, { type: 'poison' as const, duration: 3, value: 6 }] };
        message = 'ðŸ§ª Poison Gas Trap! Poisoned for 3 turns.';
        break;
      }
      default:
        message = 'âš ï¸ You triggered a trap!';
    }

    setGameState({ ...state, player: newPlayer, board: newBoard });
    showNotification(message);
    if (newPlayer.health <= 0) { SaveEngine.clearSlot(activeSlot); setTimeout(() => setPhase('game-over'), 500); }
    else autoSave({ ...state, player: newPlayer, board: newBoard });
  };

  // â”€â”€ Events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleRandomEventWith = (state: GameState, destiny?: { state: string; emoji: string; label: string } | null) => {
    // Check for delayed consequence payoffs first
    const payoff = checkEventPayoff(state);
    if (payoff) {
      let newPlayer = state.player;
      let newState = consumePayoff(state, payoff);
      if (payoff.coins) newPlayer = { ...newPlayer, coins: newPlayer.coins + payoff.coins };
      if (payoff.hp) newPlayer = { ...newPlayer, health: Math.max(1, Math.min(newPlayer.maxHealth, newPlayer.health + payoff.hp)) };
      if (payoff.attack) newPlayer = { ...newPlayer, attack: newPlayer.attack + payoff.attack };
      if (payoff.reroll) newState = { ...newState, diceManipulation: { ...newState.diceManipulation, rerolls: newState.diceManipulation.rerolls + 1 } };
      newState = { ...newState, player: newPlayer };
      setGameState(newState);
      showNotification(payoff.message);
      if (GameEngine.isFloorComplete(newState)) handleFloorComplete(newState);
      return;
    }

    const events = [
      { text: 'You found a treasure chest! +20 gold', coins: 20 },
      { text: 'A mysterious stranger heals you! +15 HP', heal: 15 },
      { text: 'You feel stronger! +2 ATK', attack: 2 },
      { text: 'Dice Blessing! +1 Reroll this floor', reroll: true },
      { text: 'A dark spirit curses you!', curse: true },
      { text: 'A fire spirit scorches you!', burn: true },
      { text: 'Nothing happens...', },
    ];
    let event = events[Math.floor(Math.random() * events.length)];
    let newPlayer = state.player;
    let newState = state;

    // Destiny overrides for events
    if (destiny?.state === 'exalted') {
      event = { text: ' Exalted! Best possible outcome!', coins: 50, heal: 30, attack: 3 } as any;
    } else if (destiny?.state === 'cursed') {
      event = { text: ' Cursed! A dark spirit curses you!', curse: true } as any;
    } else if (destiny?.state === 'favored' && (event as any).curse) {
      event = { text: ' Favored! Luck shields you. +10 HP', heal: 10 } as any;
    }

    if ((event as any).coins) newPlayer = { ...newPlayer, coins: newPlayer.coins + (event as any).coins };
    if ((event as any).heal) newPlayer = { ...newPlayer, health: Math.min(newPlayer.maxHealth, newPlayer.health + (event as any).heal) };
    if ((event as any).attack) newPlayer = { ...newPlayer, attack: newPlayer.attack + (event as any).attack };
    if ((event as any).reroll) {
      newState = { ...newState, diceManipulation: { ...newState.diceManipulation, rerolls: newState.diceManipulation.rerolls + 1 } };
    }
    if ((event as any).curse) {
      const already = newPlayer.statusEffects.some((e) => e.type === 'cursed');
      if (!already) newPlayer = { ...newPlayer, statusEffects: [...newPlayer.statusEffects, { type: 'cursed' as const, duration: 5, value: 8 }] };
    }
    if ((event as any).burn) {
      const already = newPlayer.statusEffects.some((e) => e.type === 'burn');
      newPlayer = { ...newPlayer, statusEffects: already
        ? newPlayer.statusEffects.map((e) => e.type === 'burn' ? { ...e, duration: Math.max(e.duration, 3) } : e)
        : [...newPlayer.statusEffects, { type: 'burn' as const, duration: 3, value: 5 }] };
    }

    newState = { ...newState, player: newPlayer };
    setGameState(newState);
    showNotification(event.text);
    if (GameEngine.isFloorComplete(newState)) handleFloorComplete(newState);
  };

  // â”€â”€ Floor / Dungeon progression â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFloorComplete = (state: GameState) => {
    if (isDungeonBossFloor(state.currentFloor)) {
      setGameState(state);
      setPhase('dungeon-clear');
    } else {
      setGameState(state);
      setFloorCompleteState(state);
      setPendingFloorAdvance(state);
    }
  };

  const confirmFloorAdvance = () => {
    const src = pendingFloorAdvance ?? floorCompleteState;
    if (!src) return;
    const newState = GameEngine.advanceFloor(src);
    setGameState(newState);
    setPendingFloorAdvance(null);
    setFloorCompleteState(null);
    showNotification(`Welcome to Floor ${newState.currentFloor}!`);
    autoSave(newState);
  };

  const handleDungeonContinue = () => {
    if (!gameState) return;
    const advanced = GameEngine.advanceFloor(gameState);
    const healAmount = Math.floor(advanced.player.maxHealth * 0.4);
    const rewardedPlayer = {
      ...advanced.player,
      health: Math.min(advanced.player.maxHealth, advanced.player.health + healAmount),
      ...(advanced.player.maxMana !== undefined ? { mana: advanced.player.maxMana } : {}),
    };
    setGameState({ ...advanced, player: rewardedPlayer });
    autoSave({ ...advanced, player: rewardedPlayer });
    setPhase('playing');
    showNotification(`Dungeon ${getDungeonNumber(gameState.currentFloor)} cleared! HP restored. Entering Dungeon ${getDungeonNumber(advanced.currentFloor)}...`);
  };

  // â”€â”€ Weapon upgrades â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleWeaponUpgradePurchase = (upgradeId: string): { success: boolean; message: string } => {
    if (!gameState) return { success: false, message: 'No game state.' };
    const outcome = WeaponUpgradeEngine.purchaseUpgrade(gameState.player.class, gameState.player.coins, upgradeId, gameState.currentFloor, upgradeState);
    if (!outcome) return { success: false, message: 'Cannot purchase this upgrade.' };
    setUpgradeState(outcome.upgradeState);
    setGameState({ ...gameState, player: { ...gameState.player, coins: outcome.coins, attack: gameState.player.attack + outcome.attackDelta, defense: gameState.player.defense + outcome.defenseDelta, maxHealth: gameState.player.maxHealth + outcome.healthDelta, health: Math.min(gameState.player.health + outcome.healthDelta, gameState.player.maxHealth + outcome.healthDelta) } });
    showNotification(outcome.message);
    return { success: true, message: outcome.message };
  };

  // â”€â”€ Restart / Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleRestart = () => {
    SaveEngine.clearSlot(activeSlot);
    setGameState(null);
    setPlayerName('');
    setPhase('character-selection');
    setLastDiceRoll(undefined);
    setCombatLog([]);
    setNotification(null);
    setPendingChoice(null);
  };

  const handleResume = (save: SaveData) => {
    setActiveSlot(save.slot);
    setPlayerName(save.playerName);
    const gs = { ...save.gameState, flags: save.gameState.flags ?? {} };
    setGameState(gs);
    setUpgradeState(save.upgradeState);
    setPhase('playing');
    setSavedRuns([]);
    showNotification(`Welcome back, ${save.playerName}!`);
  };

  const handleNewGameFromResume = (slot: number) => {
    setActiveSlot(slot);
    setSavedRuns([]);
    setPhase('character-selection');
  };

  const handleMainMenu = () => { window.location.href = '/'; };

  // â”€â”€ Debug helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const debugAddCoins = () => { if (!gameState) return; setGameState({ ...gameState, player: { ...gameState.player, coins: gameState.player.coins + 10000 } }); showNotification('Added 10000 coins!'); };
  const debugHealFull = () => { if (!gameState) return; setGameState({ ...gameState, player: { ...gameState.player, health: gameState.player.maxHealth, mana: gameState.player.maxMana || 0 } }); showNotification('Fully healed!'); };
  const debugOpenShop = () => { setIsShopOpen(true); showNotification('Shop opened!'); };
  const debugNextFloor = () => { if (!gameState) return; const s = GameEngine.advanceFloor(gameState); setGameState(s); showNotification(`Advanced to Floor ${s.currentFloor}!`); };
  const debugFightEnemy = (type: string) => { if (!gameState) return; const enemy = EnemyEngine.createEnemy(type as any, gameState.currentFloor); setGameState({ ...gameState, isInCombat: true, currentEnemy: enemy }); setPhase('combat'); setCombatEnemy(enemy); setCombatLog([`[DEBUG] A wild ${enemy.name} appears!`]); };
  const debugSetFloor = (floor: number) => { if (!gameState) return; setGameState({ ...gameState, currentFloor: floor }); showNotification(`[DEBUG] Floor set to ${floor}`); };
  const debugUnlockAllUpgrades = () => {
    if (!gameState) return;
    const classUpgrades = WeaponUpgradeEngine.getClassUpgrades(gameState.player.class);
    let cs = upgradeState; let player = gameState.player;
    for (const upgrade of classUpgrades) {
      if (cs.purchasedUpgradeIds.includes(upgrade.id)) continue;
      const { effect } = upgrade;
      cs = { purchasedUpgradeIds: [...cs.purchasedUpgradeIds, upgrade.id], totalAttackBonus: cs.totalAttackBonus + (effect.attackBonus ?? 0), totalDefenseBonus: cs.totalDefenseBonus + (effect.defenseBonus ?? 0), totalCritChanceBonus: cs.totalCritChanceBonus + (effect.critChanceBonus ?? 0), totalCritDamageBonus: cs.totalCritDamageBonus + (effect.critDamageBonus ?? 0), totalHealthBonus: cs.totalHealthBonus + (effect.healthBonus ?? 0), unlockedAbilities: effect.specialAbility ? [...cs.unlockedAbilities, effect.specialAbility] : cs.unlockedAbilities };
      player = { ...player, attack: player.attack + (effect.attackBonus ?? 0), defense: player.defense + (effect.defenseBonus ?? 0), maxHealth: player.maxHealth + (effect.healthBonus ?? 0), health: Math.min(player.health + (effect.healthBonus ?? 0), player.maxHealth + (effect.healthBonus ?? 0)) };
    }
    setUpgradeState(cs); setGameState({ ...gameState, player }); showNotification(`[DEBUG] All ${gameState.player.class} upgrades unlocked!`);
  };
  const debugResetUpgrades = () => {
    if (!gameState) return;
    const purchased = WeaponUpgradeEngine.getPurchasedUpgrades(upgradeState);
    let player = gameState.player;
    for (const upgrade of purchased) { const { effect } = upgrade; player = { ...player, attack: player.attack - (effect.attackBonus ?? 0), defense: player.defense - (effect.defenseBonus ?? 0), maxHealth: player.maxHealth - (effect.healthBonus ?? 0), health: Math.min(player.health, player.maxHealth - (effect.healthBonus ?? 0)) }; }
    setUpgradeState(WeaponUpgradeEngine.createInitialState()); setGameState({ ...gameState, player }); showNotification('[DEBUG] All weapon upgrades reset.');
  };


  // -- Early returns --
  if (phase === 'resume-prompt' && savedRuns.length > 0) return <ResumePrompt saves={savedRuns} onResume={handleResume} onNewGame={handleNewGameFromResume} />;
  if (phase === 'character-selection') return <CharacterSelection onSelect={handleCharacterSelect} />;
  if (!gameState) return null;

  const choosableTileIds = (pendingChoice && !pendingChoice.destinyResult) ? pendingChoice.tileOptions : [];

  return (
    <div className="relative w-full h-screen bg-game-bg overflow-hidden flex flex-col">
      <HUD player={gameState.player} floor={gameState.currentFloor} turnCount={gameState.turnCount} onInventoryClick={() => setIsInventoryOpen(true)} playerSpriteUrl={(gameState.player as any).spriteDataUrl} />

      {/* Board — no spacer needed, HUD floats over the board */}
      <div className="flex-1 flex items-center justify-center px-1 sm:px-4 pb-44 sm:pb-48 min-h-0">
        <div className="w-full h-full max-w-7xl relative">
          <GameBoard
            tiles={gameState.board}
            currentPosition={gameState.player.position}
            choosableTileIds={choosableTileIds}
            onTileClick={(pendingChoice && !pendingChoice.destinyResult) ? handleTileChosen : undefined}
            playerSpriteUrl={(gameState.player as any).spriteDataUrl}
          />
        </div>
      </div>

      {/* Dice Roller â€” shown only when no pending choice */}
      {phase === 'playing' && !gameState.isInCombat && !pendingChoice && (
        <DiceRoller onRoll={handleDiceRoll} lastRoll={lastDiceRoll} disabled={false} />
      )}

      {/* Contextual action buttons — shop and/or next floor */}
      {phase === 'playing' && !pendingChoice && (() => {
        const currentTile = gameState.board.find(t => t.id === gameState.player.position);
        const onShop = currentTile?.type === 'shop';
        const onNextFloor = !!(floorCompleteState && !pendingFloorAdvance);
        if (!onShop && !onNextFloor) return null;
        return (
          <div className="fixed bottom-36 sm:bottom-40 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {onShop && (
              <button
                onClick={() => setIsShopOpen(true)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg border-b-4 border-yellow-700 transition-all active:scale-95"
              >
                Visit Shop
              </button>
            )}
            {onNextFloor && (
              <button
                onClick={() => setPendingFloorAdvance(floorCompleteState)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-game-gold hover:brightness-110 text-black shadow-lg border-b-4 border-yellow-700 transition-all active:scale-95"
              >
                Next Floor
              </button>
            )}
          </div>
        );
      })()}

            {/* Dice Manipulator â€” shown after rolling, waiting for tile choice */}
      <AnimatePresence>
        {phase === 'playing' && !gameState.isInCombat && pendingChoice && (
          <DiceManipulator
            branchChoice={pendingChoice}
            board={gameState.board}
            onSelectTile={handleTileChosen}
            onConfirmDestiny={pendingChoice.destinyResult ? handleConfirmDestiny : undefined}
          />
        )}
      </AnimatePresence>

      {/* Combat UI */}
      <AnimatePresence>
        {phase === 'combat' && combatEnemy && (
          <CombatUI
            player={gameState.player}
            enemy={gameState.currentEnemy ?? combatEnemy}
            onAttack={handleAttack}
            onUseSkill={handleUseSkill}
            onFlee={!fleeUsed ? handleFlee : undefined}
            onBribe={gameState.currentEnemy?.canBeBribed && gameState.player.coins >= CombatEngine.getBribeCost(gameState.currentEnemy) ? handleBribe : undefined}
            onTruce={gameState.currentEnemy?.willAcceptTruce ? handleTruce : undefined}
            onOpenInventory={() => setIsInventoryOpen(true)}
            bribeCost={gameState.currentEnemy ? CombatEngine.getBribeCost(gameState.currentEnemy) : undefined}
            combatLog={combatLog}
            isPlayerTurn={true}
            enemyAnimState={enemyAnimState}
            playerHurt={playerHurt}
            playerSpriteUrl={(gameState.player as any).spriteDataUrl}
          />
        )}
      </AnimatePresence>

      <InventoryPanel isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} player={gameState.player} onUseItem={handleUseItem} />
      <ShopPanel isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} player={gameState.player} items={[...InventoryEngine.getShopItems(gameState.currentFloor).filter(i => i.effect.type !== 'permanent'), ...getStatUpgradeItems(gameState.statUpgradeCounts), ...(InventoryEngine.getRelicForFloor(gameState.currentFloor, gameState.player.relics ?? []) ? [InventoryEngine.getRelicForFloor(gameState.currentFloor, gameState.player.relics ?? [])!] : [])]} onPurchase={handlePurchase} statUpgradeCounts={gameState.statUpgradeCounts} />
      <ShopPanel isOpen={isSpecialShopOpen} onClose={() => setIsSpecialShopOpen(false)} player={gameState.player} items={[...InventoryEngine.getSpecialShopItems().filter(i => i.effect.type !== 'permanent'), ...getStatUpgradeItems(gameState.statUpgradeCounts)]} onPurchase={handlePurchase} title="âœ¨ Special Shop" statUpgradeCounts={gameState.statUpgradeCounts} />
      <WeaponUpgradePanel isOpen={isUpgradePanelOpen} onClose={() => setIsUpgradePanelOpen(false)} player={gameState.player} currentFloor={gameState.currentFloor} upgradeState={upgradeState} onPurchase={handleWeaponUpgradePurchase} />

      <AnimatePresence>
        {phase === 'dungeon-clear' && (
          <DungeonClearScreen dungeonNumber={getDungeonNumber(gameState.currentFloor)} player={gameState.player} turns={gameState.turnCount} onContinue={handleDungeonContinue} />
        )}
      </AnimatePresence>

      {/* Floor advance confirmation prompt */}
      <AnimatePresence>
        {pendingFloorAdvance && !isShopOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-game-primary border-2 border-game-gold rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="text-4xl mb-3">🏁</div>
              <h2 className="text-white font-black text-xl mb-1">Floor Complete!</h2>
              <p className="text-gray-400 text-sm mb-1">
                Floor {pendingFloorAdvance.currentFloor} cleared.
              </p>
              <p className="text-gray-500 text-xs mb-5">
                {pendingFloorAdvance.player.health}/{pendingFloorAdvance.player.maxHealth} HP · {pendingFloorAdvance.player.coins} coins
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={confirmFloorAdvance}
                  className="flex-1 bg-game-gold text-black font-black py-3 rounded-xl text-sm shadow-lg"
                >
                  ▶ Advance to Floor {pendingFloorAdvance.currentFloor + 1}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setPendingFloorAdvance(null)}
                  className="px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl text-sm"
                >
                  Stay
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'game-over' && (
          <GameOverScreen isVictory={false} floor={gameState.currentFloor} turns={gameState.turnCount} coinsEarned={gameState.player.coins} characterClass={gameState.player.class} playerName={playerName} enemiesKilled={gameState.enemiesKilled ?? 0} onRestart={handleRestart} onMainMenu={handleMainMenu} />
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 px-4 max-w-[90vw]">
            <div className="bg-game-primary border-2 border-game-gold rounded-lg px-4 sm:px-6 py-2 sm:py-3 shadow-2xl">
              <p className="text-white font-bold text-sm sm:text-base text-center">{notification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <button onClick={() => setShowDebugPanel(!showDebugPanel)} className="fixed top-20 right-2 sm:right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg">
          ðŸ› Debug
        </button>
      )}
      {process.env.NODE_ENV === 'development' && (
        <AnimatePresence>
          {showDebugPanel && (
            <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
              className="fixed top-32 right-2 sm:right-4 z-50 bg-game-primary border-2 border-purple-500 rounded-xl p-3 shadow-2xl w-44 max-h-[70vh] overflow-y-auto">
              <h3 className="text-white font-bold mb-3 text-sm">Debug Tools</h3>
              <div className="flex flex-col gap-2">
                <button onClick={debugAddCoins} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs font-bold">ðŸ’° +10000 Coins</button>
                <button onClick={debugHealFull} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs font-bold">â¤ï¸ Full Heal</button>
                <button onClick={debugOpenShop} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold">ðŸª Open Shop</button>
                <button onClick={() => setIsSpecialShopOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-xs font-bold">âœ¨ Special Shop</button>
                <button onClick={debugNextFloor} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-xs font-bold">â¬†ï¸ Next Floor</button>
                <div className="border-t border-purple-400 pt-2 mt-1">
                  <p className="text-purple-300 text-xs mb-2 font-bold">âš”ï¸ Fight Enemy</p>
                  <button onClick={() => { if (!gameState) return; const boss = EnemyEngine.createBoss(gameState.currentFloor); setGameState({ ...gameState, isInCombat: true, currentEnemy: boss })

; setPhase('combat'); setCombatEnemy(boss); setCombatLog([`ðŸ’€ [DEBUG] ${boss.name} emerges!`]); }} className="w-full bg-yellow-800 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-2 border border-yellow-500">
                    ðŸ’€ Fight Boss (F{gameState?.currentFloor})
                  </button>
                  {Object.entries(ENEMY_TYPES).map(([, type]) => (
                    <button key={type} onClick={() => debugFightEnemy(type)} className="w-full bg-red-800 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1">
                      {type.replace(/(\d)/, ' $1').replace(/^./, s => s.toUpperCase())}
                    </button>
                  ))}
                </div>
                <div className="border-t border-purple-400 pt-2 mt-1">
                  <p className="text-purple-300 text-xs mb-2 font-bold">âš”ï¸ Weapon Upgrades</p>
                  <button onClick={() => setIsUpgradePanelOpen(true)} className="w-full bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1">ðŸ”§ Open Upgrades</button>
                  <button onClick={debugUnlockAllUpgrades} className="w-full bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1">ðŸ”“ Unlock All</button>
                  <button onClick={debugResetUpgrades} className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1">ðŸ”„ Reset Upgrades</button>
                  <p className="text-purple-300 text-xs mb-1 mt-2 font-bold">Set Floor</p>
                  <div className="grid grid-cols-3 gap-1">
                    {[1, 3, 6, 9].map((f) => (
                      <button key={f} onClick={() => debugSetFloor(f)} className="bg-teal-700 hover:bg-teal-600 text-white px-2 py-1 rounded text-xs font-bold">F{f}</button>
                    ))}
                  </div>
                  {upgradeState.purchasedUpgradeIds.length > 0 && (
                    <p className="text-green-400 text-xs mt-2">âœ… {upgradeState.purchasedUpgradeIds.length} upgrade{upgradeState.purchasedUpgradeIds.length !== 1 ? 's' : ''} owned</p>
                  )}
                </div>
                <div className="border-t border-purple-400 pt-2 mt-1">
                  <p className="text-purple-300 text-xs mb-2 font-bold">ðŸŽ² Traps</p>
                  <button onClick={() => { if (!gameState) return; handleTrapTrigger(gameState, { id: gameState.player.position, type: 'trap', x: 0, y: 0, visited: true, trapType: 'fire', trapTriggered: false }); }} className="w-full bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1">ðŸ”¥ Fire Trap</button>
                  <button onClick={() => { if (!gameState) return; handleTrapTrigger(gameState, { id: gameState.player.position, type: 'trap', x: 0, y: 0, visited: true, trapType: 'spike', trapTriggered: false }); }} className="w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1">ðŸ—¡ï¸ Spike Trap</button>
                  <button onClick={() => { if (!gameState) return; handleTrapTrigger(gameState, { id: gameState.player.position, type: 'trap', x: 0, y: 0, visited: true, trapType: 'poison_gas', trapTriggered: false }); }} className="w-full bg-green-700 hover:bg-green-800 text-white px-3 py-1.5 rounded text-xs font-bold">ðŸ§ª Poison Trap</button>
                
                <div className="border-t border-purple-400 pt-2 mt-1">
                  <p className="text-purple-300 text-xs mb-2 font-bold">Flags</p>
                  <button
                    onClick={() => { if (!gameState) return; const e = gameState.currentEnemy ?? { type: 'goblin', id: 'debug' } as any; setGameState(onFlee({ ...gameState }, e)); showNotification('[DEBUG] Flee flag set'); }}
                    className="w-full bg-blue-800 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  >Set Flee Flag</button>
                  <button
                    onClick={() => { if (!gameState) return; const e = gameState.currentEnemy ?? { type: 'goblin', id: 'debug' } as any; setGameState(onBribe({ ...gameState }, e)); showNotification('[DEBUG] Bribe flag set'); }}
                    className="w-full bg-yellow-800 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  >Set Bribe Flag</button>
                  <button
                    onClick={() => { if (!gameState) return; const e = gameState.currentEnemy ?? { type: 'skeleton', id: 'debug' } as any; setGameState(onTruce({ ...gameState }, e)); showNotification('[DEBUG] Truce flag set'); }}
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  >Set Truce Flag</button>
                  <button
                    onClick={() => {
                      if (!gameState) return;
                      const payoff = checkEventPayoff(gameState);
                      if (!payoff) { showNotification('[DEBUG] No payoff ready'); return; }
                      let p = gameState.player;
                      let s = consumePayoff(gameState, payoff);
                      if (payoff.coins) p = { ...p, coins: p.coins + payoff.coins };
                      if (payoff.hp) p = { ...p, health: Math.max(1, Math.min(p.maxHealth, p.health + payoff.hp)) };
                      if (payoff.attack) p = { ...p, attack: p.attack + payoff.attack };
                      if (payoff.reroll) s = { ...s, diceManipulation: { ...s.diceManipulation, rerolls: s.diceManipulation.rerolls + 1 } };
                      setGameState({ ...s, player: p });
                      showNotification(`[DEBUG] ${payoff.message}`);
                    }}
                    className="w-full bg-pink-800 hover:bg-pink-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  >Trigger Payoff</button>
                  <button
                    onClick={() => { if (!gameState) return; setGameState({ ...gameState, flags: {} }); showNotification('[DEBUG] Flags cleared'); }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  >Clear Flags</button>
                  {gameState && Object.keys(gameState.flags).length > 0 && (
                    <div className="mt-1 max-h-20 overflow-y-auto space-y-0.5">
                      {Object.entries(gameState.flags).map(([k, v]) => (
                        <p key={k} className="text-[9px] text-gray-400 truncate">{k}: {String(v)}</p>
                      ))}
                    </div>
                  )}
                </div>
</div>
                <div className="border-t border-purple-400 pt-2 mt-1">
                  <p className="text-purple-300 text-xs mb-2 font-bold">🚩 Flags</p>
                  <button
                    onClick={() => { if (!gameState) return; const e = gameState.currentEnemy ?? { type: 'goblin', id: 'debug' } as any; setGameState(onFlee({ ...gameState }, e)); showNotification('[DEBUG] Flee flag set'); }}
                    className="w-full bg-blue-800 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  >🏃 Set Flee Flag</button>
                  <button
                    onClick={() => { if (!gameState) return; const e = gameState.currentEnemy ?? { type: 'goblin', id: 'debug' } as any; setGameState(onBribe({ ...gameState }, e)); showNotification('[DEBUG] Bribe flag set'); }}
                    className="w-full bg-yellow-800 hover:bg-yellow-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  > Set Bribe Flag</button>
                  <button
                    onClick={() => { if (!gameState) return; const e = gameState.currentEnemy ?? { type: 'skeleton', id: 'debug' } as any; setGameState(onTruce({ ...gameState }, e)); showNotification('[DEBUG] Truce flag set'); }}
                    className="w-full bg-emerald-800 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  > Set Truce Flag</button>
                  <button
                    onClick={() => {
                      if (!gameState) return;
                      const payoff = checkEventPayoff(gameState);
                      if (!payoff) { showNotification('[DEBUG] No payoff ready'); return; }
                      let p = gameState.player;
                      let s = consumePayoff(gameState, payoff);
                      if (payoff.coins) p = { ...p, coins: p.coins + payoff.coins };
                      if (payoff.hp) p = { ...p, health: Math.max(1, Math.min(p.maxHealth, p.health + payoff.hp)) };
                      if (payoff.attack) p = { ...p, attack: p.attack + payoff.attack };
                      if (payoff.reroll) s = { ...s, diceManipulation: { ...s.diceManipulation, rerolls: s.diceManipulation.rerolls + 1 } };
                      setGameState({ ...s, player: p });
                      showNotification(`[DEBUG] ${payoff.message}`);
                    }}
                    className="w-full bg-pink-800 hover:bg-pink-700 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  > Trigger Payoff</button>
                  <button
                    onClick={() => { if (!gameState) return; setGameState({ ...gameState, flags: {} }); showNotification('[DEBUG] Flags cleared'); }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-bold mb-1"
                  > Clear Flags</button>
                  {gameState && Object.keys(gameState.flags).length > 0 && (
                    <div className="mt-1 max-h-20 overflow-y-auto space-y-0.5">
                      {Object.entries(gameState.flags).map(([k, v]) => (
                        <p key={k} className="text-[9px] text-gray-400 truncate">{k}: {String(v)}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

