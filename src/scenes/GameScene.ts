import Phaser from "phaser";
import { Player, TileType, GameState, StatusEffectType } from "../types/GameTypes";
import { GameManager } from "../managers/GameManager";
import { BoardManager } from "../managers/BoardManager";
import { SpriteManager, CharacterType } from "../managers/SpriteManager";

export class GameScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private boardManager!: BoardManager;
  private spriteManager!: SpriteManager;
  private player!: Player;
  private gameState!: GameState;
  private diceButton!: Phaser.GameObjects.Text;
  private playerSprite!: Phaser.GameObjects.Image;
  private uiElements: { [key: string]: Phaser.GameObjects.Text } = {};

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    console.log('GameScene: Starting preload...');
    // Load all sprites
    this.spriteManager = new SpriteManager(this);
    this.spriteManager.preloadAll();
    
    // Add completion callback
    this.load.on('complete', () => {
      console.log('GameScene: All assets loaded successfully');
    });
  }

  init(data: any) {
    if (data && data.gameState) {
      this.gameState = data.gameState;
      this.player = this.gameState.player;
    }
  }

  create() {
    this.gameManager = new GameManager();
    this.boardManager = new BoardManager(this);
    this.spriteManager = new SpriteManager(this);

    if (!this.gameState) {
      this.gameState = this.gameManager.initializeGame();
      this.player = this.gameState.player;
    }

    this.boardManager.createBoard(this.gameState.board);
    this.createPlayer();
    this.createUI();
    this.createDiceButton();

    // Add keyboard shortcut for testing events (E key)
    this.input.keyboard?.on("keydown-E", () => {
      this.handleEventTile();
    });

    // Add keyboard shortcut for simulating turns (T key)
    this.input.keyboard?.on("keydown-T", () => {
      this.simulateTurn();
    });
  }

  private createPlayer() {
    const currentTile = this.gameState.board[this.player.position];
    console.log('Creating player sprite at:', currentTile.x, currentTile.y);
    this.playerSprite = this.spriteManager.createKnight(currentTile.x, currentTile.y, 1);
    console.log('Player sprite created:', this.playerSprite);
  }

  private createUI() {
    const padding = 20;

    this.uiElements.health = this.add.text(padding, padding, "", {
      fontSize: "18px",
      color: "#ff6b6b",
      fontFamily: "Courier New, monospace",
    });

    this.uiElements.coins = this.add.text(padding, padding + 30, "", {
      fontSize: "18px",
      color: "#ffe66d",
      fontFamily: "Courier New, monospace",
    });

    this.uiElements.defense = this.add.text(padding, padding + 60, "", {
      fontSize: "18px",
      color: "#4ecdc4",
      fontFamily: "Courier New, monospace",
    });

    this.uiElements.attack = this.add.text(padding, padding + 90, "", {
      fontSize: "18px",
      color: "#ff9f43",
      fontFamily: "Courier New, monospace",
    });

    this.uiElements.floor = this.add.text(padding, padding + 120, "", {
      fontSize: "18px",
      color: "#4ecdc4",
      fontFamily: "Courier New, monospace",
    });

    this.uiElements.status = this.add.text(padding, padding + 150, "", {
      fontSize: "16px",
      color: "#e74c3c",
      fontFamily: "Courier New, monospace",
    });

    this.updateUI();
  }
  private createDiceButton() {
    const centerX = this.cameras.main.width / 2;
    const bottomY = this.cameras.main.height - 80;

    this.diceButton = this.add
      .text(centerX, bottomY, "ROLL DICE", {
        fontSize: "24px",
        color: "#ffe66d",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#16213e",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    this.diceButton.on("pointerdown", () => this.rollDice());
    this.diceButton.on("pointerover", () =>
      this.diceButton.setStyle({ color: "#ff6b6b" })
    );
    this.diceButton.on("pointerout", () =>
      this.diceButton.setStyle({ color: "#ffe66d" })
    );

    // Test event button - positioned to the left of dice button
    const testButton = this.add
      .text(centerX - 150, bottomY, "TEST EVENT", {
        fontSize: "18px",
        color: "#4ecdc4",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#16213e",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    testButton.on("pointerdown", () => this.handleEventTile());
    testButton.on("pointerover", () =>
      testButton.setStyle({ color: "#ff6b6b" })
    );
    testButton.on("pointerout", () =>
      testButton.setStyle({ color: "#4ecdc4" })
    );

    // Test turn button - positioned to the right of dice button
    const testTurnButton = this.add
      .text(centerX + 150, bottomY, "SIMULATE TURN", {
        fontSize: "16px",
        color: "#e74c3c",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#16213e",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive();

    testTurnButton.on("pointerdown", () => this.simulateTurn());
    testTurnButton.on("pointerover", () =>
      testTurnButton.setStyle({ color: "#ff6b6b" })
    );
    testTurnButton.on("pointerout", () =>
      testTurnButton.setStyle({ color: "#e74c3c" })
    );
  }

  private rollDice() {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    this.gameState.diceValue = diceValue;

    this.diceButton.setStyle({ color: "#666666" });
    this.diceButton.disableInteractive();

    const diceText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2,
        `Rolled: ${diceValue}`,
        {
          fontSize: "48px",
          color: "#ff6b6b",
          fontFamily: "Courier New, monospace",
        }
      )
      .setOrigin(0.5);

    this.time.delayedCall(1500, () => {
      diceText.destroy();
      this.movePlayer(diceValue);
    });
  }

  private movePlayer(steps: number) {
    const boardSize = this.gameState.board.length;
    let currentStep = 0;

    const moveStep = () => {
      if (currentStep < steps) {
        this.player.position = (this.player.position + 1) % boardSize;
        const tile = this.gameState.board[this.player.position];

        this.tweens.add({
          targets: this.playerSprite,
          x: tile.x,
          y: tile.y,
          duration: 300,
          ease: "Power2",
        });

        currentStep++;
        this.time.delayedCall(400, moveStep);
      } else {
        this.handleTileEvent();
      }
    };

    moveStep();
  }

  private handleTileEvent() {
    const currentTile = this.gameState.board[this.player.position];

    switch (currentTile.type) {
      case TileType.ENEMY:
        this.handleEnemyTile();
        break;
      case TileType.TREASURE:
        this.handleTreasureTile();
        break;
      case TileType.SHOP:
        this.handleShopTile();
        break;
      case TileType.EVENT:
        this.handleEventTile();
        break;
      case TileType.BOSS:
        this.handleBossTile();
        break;
      default:
        this.endTurn();
        break;
    }
  }

  private handleEnemyTile() {
    this.scene.start("CombatScene", {
      player: this.player,
      enemy: this.gameManager.generateEnemy(this.gameState.currentFloor),
      gameState: this.gameState,
    });
  }

  private handleTreasureTile() {
    const coins = Math.floor(Math.random() * 20) + 10;
    this.player.coins += coins;
    this.showMessage(`Found ${coins} coins!`, "#ffe66d");
    this.endTurn();
  }

  private handleShopTile() {
    this.showShopMenu();
  }

  private showShopMenu() {
    // Create shop background
    const shopBg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      400,
      300,
      0x16213e
    );
    shopBg.setStrokeStyle(2, 0x4ecdc4);

    // Shop title
    const shopTitle = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 120,
      'SHOP',
      {
        fontSize: '32px',
        color: '#4ecdc4',
        fontFamily: 'Courier New, monospace'
      }
    ).setOrigin(0.5);

    // Antidote option
    const antidotePrice = 25;
    const antidoteText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 60,
      `Antidote - ${antidotePrice} coins`,
      {
        fontSize: '20px',
        color: this.player.coins >= antidotePrice ? '#27ae60' : '#e74c3c',
        fontFamily: 'Courier New, monospace'
      }
    ).setOrigin(0.5);

    if (this.player.coins >= antidotePrice) {
      antidoteText.setInteractive();
      antidoteText.on('pointerdown', () => {
        this.buyAntidote(antidotePrice);
        this.closeShop([shopBg, shopTitle, antidoteText, healingText, closeButton]);
      });
      antidoteText.on('pointerover', () => antidoteText.setStyle({ color: '#2ecc71' }));
      antidoteText.on('pointerout', () => antidoteText.setStyle({ color: '#27ae60' }));
    }

    // Healing potion option
    const healingPrice = 15;
    const healingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 20,
      `Healing Potion - ${healingPrice} coins`,
      {
        fontSize: '20px',
        color: this.player.coins >= healingPrice ? '#f39c12' : '#e74c3c',
        fontFamily: 'Courier New, monospace'
      }
    ).setOrigin(0.5);

    if (this.player.coins >= healingPrice) {
      healingText.setInteractive();
      healingText.on('pointerdown', () => {
        this.buyHealing(healingPrice);
        this.closeShop([shopBg, shopTitle, antidoteText, healingText, closeButton]);
      });
      healingText.on('pointerover', () => healingText.setStyle({ color: '#e67e22' }));
      healingText.on('pointerout', () => healingText.setStyle({ color: '#f39c12' }));
    }

    // Close button
    const closeButton = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 60,
      'LEAVE SHOP',
      {
        fontSize: '18px',
        color: '#ffe66d',
        fontFamily: 'Courier New, monospace',
        backgroundColor: '#16213e',
        padding: { x: 15, y: 8 }
      }
    ).setOrigin(0.5).setInteractive();

    closeButton.on('pointerdown', () => {
      this.closeShop([shopBg, shopTitle, antidoteText, healingText, closeButton]);
    });
    closeButton.on('pointerover', () => closeButton.setStyle({ color: '#ff6b6b' }));
    closeButton.on('pointerout', () => closeButton.setStyle({ color: '#ffe66d' }));
  }

  private buyAntidote(price: number) {
    this.player.coins -= price;
    
    if (this.gameManager.hasStatusEffect(this.player, StatusEffectType.POISON)) {
      this.gameManager.removeStatusEffect(this.player, StatusEffectType.POISON);
      const antidoteEffect = this.gameManager.createAntidoteEffect();
      this.gameManager.addStatusEffect(this.player, antidoteEffect);
      this.showMessage('Poison cured! Antidote provides healing!', '#27ae60');
    } else {
      this.player.health = Math.min(this.player.maxHealth, this.player.health + 20);
      this.showMessage('Not poisoned, but gained 20 HP!', '#27ae60');
    }
  }

  private buyHealing(price: number) {
    this.player.coins -= price;
    const oldHealth = this.player.health;
    this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
    const healed = this.player.health - oldHealth;
    this.showMessage(`Healed ${healed} HP!`, '#f39c12');
  }

  private closeShop(elements: Phaser.GameObjects.GameObject[]) {
    elements.forEach(element => element.destroy());
    this.endTurn();
  }

  private handleEventTile() {
    const events = [
      {
        text: "Found a healing potion!",
        effect: () => {
          const oldHealth = this.player.health;
          this.player.health = Math.min(
            this.player.maxHealth,
            this.player.health + 20
          );
          const healed = this.player.health - oldHealth;
          return healed > 0
            ? `Healed ${healed} HP!`
            : "Already at full health!";
        },
        color: "#2ecc71",
      },
      {
        text: "Cursed by a witch!",
        effect: () => {
          this.player.health = Math.max(1, this.player.health - 10);
          return "Lost 10 health!";
        },
        color: "#e74c3c",
      },
      {
        text: "Lucky find!",
        effect: () => {
          this.player.coins += 15;
          return "Found 15 coins!";
        },
        color: "#f1c40f",
      },
      {
        text: "Found a Sword!",
        effect: () => {
          this.player.attack += 3;
          return "Attack increased by 3!";
        },
        color: "#ff9f43",
      },
      {
        text: "Poisonous trap!",
        effect: () => {
          if (this.gameManager.hasStatusEffect(this.player, StatusEffectType.POISON)) {
            return "Already poisoned!";
          } else {
            const poisonEffect = this.gameManager.createPoisonEffect();
            this.gameManager.addStatusEffect(this.player, poisonEffect);
            return "You've been poisoned! Find an antidote!";
          }
        },
        color: "#8e44ad",
      },
      {
        text: "Blessing!",
        effect: () => {
          if (this.gameManager.hasStatusEffect(this.player, StatusEffectType.BLESSING)) {
            return "Already Blessed!";
          } else {
            const blessingEffect = this.gameManager.createBlessingEffect();
            this.gameManager.addStatusEffect(this.player, blessingEffect);
            return "Blessings of the realm";
          }
        },
        color: "#ff9f43",
      },
      {
        text: "Found an antidote!",
        effect: () => {
          if (this.gameManager.hasStatusEffect(this.player, StatusEffectType.POISON)) {
            this.gameManager.removeStatusEffect(this.player, StatusEffectType.POISON);
            const antidoteEffect = this.gameManager.createAntidoteEffect();
            this.gameManager.addStatusEffect(this.player, antidoteEffect);
            return "Poison cured! Antidote provides healing!";
          } else {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 15);
            return "Not poisoned, but gained 15 HP!";
          }
        },
        color: "#27ae60",
      },
      {
        text: "Mysterious herb!",
        effect: () => {
          if (this.gameManager.hasStatusEffect(this.player, StatusEffectType.POISON)) {
            // 50% chance to cure poison
            if (Math.random() < 0.5) {
              this.gameManager.removeStatusEffect(this.player, StatusEffectType.POISON);
              return "The herb cured your poison!";
            } else {
              return "The herb had no effect on the poison...";
            }
          } else {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 10);
            return "The herb restored 10 HP!";
          }
        },
        color: "#16a085",
      },
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    const result = event.effect();
    this.showEventMessage(event.text, result, event.color);
    this.endTurn();
  }

  private handleBossTile() {
    this.showMessage("Boss fight coming soon!", "#ff6b6b");
    this.endTurn();
  }

  private showMessage(text: string, color: string) {
    const message = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 100,
        text,
        {
          fontSize: "24px",
          color: color,
          fontFamily: "Courier New, monospace",
          backgroundColor: "#000000",
          padding: { x: 20, y: 10 },
        }
      )
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => message.destroy());
  }

  private showEventMessage(
    eventText: string,
    resultText: string,
    color: string
  ) {
    const eventMessage = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 120,
        eventText,
        {
          fontSize: "24px",
          color: color,
          fontFamily: "Courier New, monospace",
          backgroundColor: "#000000",
          padding: { x: 20, y: 10 },
        }
      )
      .setOrigin(0.5);

    const resultMessage = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 80,
        resultText,
        {
          fontSize: "18px",
          color: "#ffffff",
          fontFamily: "Courier New, monospace",
          backgroundColor: "#333333",
          padding: { x: 15, y: 8 },
        }
      )
      .setOrigin(0.5);

    this.tweens.add({
      targets: [eventMessage, resultMessage],
      alpha: { from: 0, to: 1 },
      scale: { from: 0.8, to: 1 },
      duration: 500,
      ease: "Back.easeOut",
    });

    this.time.delayedCall(3000, () => {
      eventMessage.destroy();
      resultMessage.destroy();
    });
  }

  private endTurn() {
    // Apply status effects
    const statusMessages = this.gameManager.applyStatusEffects(this.player);
    
    // Show status effect messages if any
    if (statusMessages.length > 0) {
      const combinedMessage = statusMessages.join('\n');
      this.showMessage(combinedMessage, '#9b59b6');
    }
    
    this.updateUI();
    this.time.delayedCall(2500, () => {
      this.diceButton.setStyle({ color: "#ffe66d" });
      this.diceButton.setInteractive();
    });
  }

  private simulateTurn() {
    // Apply status effects without moving or triggering events
    const statusMessages = this.gameManager.applyStatusEffects(this.player);
    
    // Show what happened this turn
    let turnMessage = "Turn simulated!";
    if (statusMessages.length > 0) {
      turnMessage = `Turn simulated!\n${statusMessages.join('\n')}`;
    } else {
      turnMessage = "Turn simulated!\nNo status effects active.";
    }
    
    this.showMessage(turnMessage, "#e74c3c");
    this.updateUI();
    
    // Check if player died from poison
    if (this.player.health <= 1 && this.gameManager.hasStatusEffect(this.player, StatusEffectType.POISON)) {
      this.time.delayedCall(2000, () => {
        this.showMessage("You died from poison!", "#ff0000");
        this.time.delayedCall(2000, () => {
          this.scene.start("MenuScene");
        });
      });
    }
  }

  private updateUI() {
    this.uiElements.health.setText(
      `Health: ${this.player.health}/${this.player.maxHealth}`
    );
    this.uiElements.coins.setText(`Coins: ${this.player.coins}`);
    this.uiElements.attack.setText(`Attack: ${this.player.attack}`);
    this.uiElements.defense.setText(`Defense: ${this.player.defense}`);
    this.uiElements.floor.setText(`Floor: ${this.gameState.currentFloor}`);
    
    // Show status effects
    const statusTexts = this.player.statusEffects.map(effect => {
      switch (effect.type) {
        case StatusEffectType.POISON:
          return '☠️ POISONED';
        case StatusEffectType.REGENERATION:
          return '💚 HEALING';
        default:
          return effect.type.toUpperCase();
      }
    });
    
    this.uiElements.status.setText(statusTexts.join(' | '));
  }
}
