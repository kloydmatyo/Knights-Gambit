import {
  Player,
  GameState,
  BoardTile,
  TileType,
  Enemy,
  PlayerStats,
  StatusEffect,
  StatusEffectType,
} from "../types/GameTypes";

export class GameManager {
  private readonly BOARD_SIZE = 20;

  initializeGame(): GameState {
    const player = this.createPlayer();
    const board = this.generateBoard();

    return {
      player,
      currentFloor: 1,
      board,
      isPlayerTurn: true,
      diceValue: 0,
    };
  }

  private createPlayer(): Player {
    return {
      id: "player1",
      name: "Knight",
      level: 1,
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 5,
      coins: 50,
      position: 0,
      equipment: {},
      inventory: [],
      stats: {
        gamesPlayed: 0,
        enemiesDefeated: 0,
        coinsEarned: 0,
        floorsCompleted: 0,
      },
      statusEffects: [],
    };
  }

  generateBoard(): BoardTile[] {
    const board: BoardTile[] = [];
    const centerX = 512;
    const centerY = 300;
    const radius = 200;

    for (let i = 0; i < this.BOARD_SIZE; i++) {
      const angle = (i / this.BOARD_SIZE) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      let tileType: TileType;
      if (i === 0) {
        tileType = TileType.START;
      } else if (i === this.BOARD_SIZE - 1) {
        tileType = TileType.BOSS;
      } else {
        // Random tile distribution
        const rand = Math.random();
        if (rand < 0.4) {
          tileType = TileType.ENEMY;
        } else if (rand < 0.6) {
          tileType = TileType.TREASURE;
        } else if (rand < 0.75) {
          tileType = TileType.EVENT;
        } else if (rand < 0.85) {
          tileType = TileType.SHOP;
        } else {
          tileType = TileType.EMPTY;
        }
      }

      board.push({
        id: i,
        type: tileType,
        x: Math.round(x),
        y: Math.round(y),
      });
    }

    return board;
  }

  generateEnemy(floor: number): Enemy {
    const enemies = [
      {
        name: "Goblin",
        baseHealth: 30,
        baseAttack: 8,
        baseDefense: 2,
        coins: 15,
      },
      {
        name: "Orc",
        baseHealth: 50,
        baseAttack: 12,
        baseDefense: 4,
        coins: 25,
      },
      {
        name: "Skeleton",
        baseHealth: 40,
        baseAttack: 10,
        baseDefense: 3,
        coins: 20,
      },
      {
        name: "Troll",
        baseHealth: 80,
        baseAttack: 15,
        baseDefense: 6,
        coins: 40,
      },
    ];

    const template = enemies[Math.floor(Math.random() * enemies.length)];
    const floorMultiplier = 1 + (floor - 1) * 0.3;

    return {
      id: `enemy_${Date.now()}`,
      name: template.name,
      health: Math.round(template.baseHealth * floorMultiplier),
      maxHealth: Math.round(template.baseHealth * floorMultiplier),
      attack: Math.round(template.baseAttack * floorMultiplier),
      defense: Math.round(template.baseDefense * floorMultiplier),
      coins: Math.round(template.coins * floorMultiplier),
    };
  }

  saveGame(gameState: GameState): void {
    try {
      localStorage.setItem("knights_gambit_save", JSON.stringify(gameState));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  loadGame(): GameState | null {
    try {
      const saveData = localStorage.getItem("knights_gambit_save");
      return saveData ? JSON.parse(saveData) : null;
    } catch (error) {
      console.error("Failed to load game:", error);
      return null;
    }
  }

  // Status effect management
  addStatusEffect(player: Player, effect: StatusEffect): void {
    // Remove existing effect of same type
    player.statusEffects = player.statusEffects.filter(
      (e) => e.type !== effect.type
    );
    // Add new effect
    player.statusEffects.push(effect);
  }

  removeStatusEffect(player: Player, effectType: StatusEffectType): void {
    player.statusEffects = player.statusEffects.filter(
      (e) => e.type !== effectType
    );
  }

  hasStatusEffect(player: Player, effectType: StatusEffectType): boolean {
    return player.statusEffects.some((e) => e.type === effectType);
  }

  applyStatusEffects(player: Player): string[] {
    const messages: string[] = [];

    player.statusEffects.forEach((effect) => {
      switch (effect.type) {
        case StatusEffectType.POISON:
          if (effect.damage) {
            player.health = Math.max(1, player.health - effect.damage);
            messages.push(`Poison deals ${effect.damage} damage!`);
          }
          break;
        case StatusEffectType.REGENERATION:
          if (effect.damage) {
            const healed = Math.min(
              effect.damage,
              player.maxHealth - player.health
            );
            player.health += healed;
            if (healed > 0) {
              messages.push(`Regeneration heals ${healed} HP!`);
            }
          }
          break;
        case StatusEffectType.BLESSING:
          // Buff stats by +5 each turn while blessing is active
          player.attack += 5;
          player.defense += 5;
          player.health = Math.min(player.maxHealth, player.health + 5);
          messages.push(`Blessing: +5 to health, attack, and defense!`);
          break;
      }
    });

    return messages;
  }

  createPoisonEffect(): StatusEffect {
    return {
      type: StatusEffectType.POISON,
      duration: -1, // Permanent until cured
      damage: 3, // 3 damage per turn
      description: "Poisoned - loses 3 HP each turn until cured",
    };
  }

  createBlessingEffect(): StatusEffect {
    return {
      type: StatusEffectType.BLESSING,
      duration: 3,
      description: "Blessings of the realm",
    };
  }

  createAntidoteEffect(): StatusEffect {
    return {
      type: StatusEffectType.REGENERATION,
      duration: 3, // 3 turns of healing
      damage: 5, // 5 healing per turn
      description: "Antidote effect - heals 5 HP per turn for 3 turns",
    };
  }
}
