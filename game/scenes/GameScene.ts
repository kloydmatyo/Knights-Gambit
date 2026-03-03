import * as Phaser from "phaser";
import {
  Player,
  TileType,
  GameState,
  StatusEffectType,
} from "../types/GameTypes";
import { GameManager } from "../managers/GameManager";
import { BoardManager } from "../managers/BoardManager";
import { SpriteManager, CharacterType } from "../managers/SpriteManager";
import { InventoryManager } from "../managers/InventoryManager";

export class GameScene extends Phaser.Scene {
  private gameManager!: GameManager;
  private boardManager!: BoardManager;
  private spriteManager!: SpriteManager;
  private inventoryManager!: InventoryManager;
  private player!: Player;
  private gameState!: GameState;
  private selectedClass: any;
  private diceButton!: Phaser.GameObjects.Text;
  private playerSprite!: Phaser.GameObjects.Image;
  private uiElements: { [key: string]: Phaser.GameObjects.Text } = {};
  private skillButtons: Phaser.GameObjects.Text[] = [];
  private skillTooltip: Phaser.GameObjects.Text | null = null;
  private inventoryButton!: Phaser.GameObjects.Text;
  private inventoryPanel: Phaser.GameObjects.Container | null = null;
  private equipmentPanel: Phaser.GameObjects.Container | null = null;
  private isInventoryOpen = false;

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    console.log("GameScene: Starting preload...");
    // Load all sprites
    this.spriteManager = new SpriteManager(this);
    this.spriteManager.preloadAll();

    // Add completion callback
    this.load.on("complete", () => {
      console.log("GameScene: All assets loaded successfully");
    });
  }

  init(data: any) {
    if (data && data.gameState) {
      this.gameState = data.gameState;
      this.player = this.gameState.player;
    } else if (data && data.selectedClass) {
      // Store selected class for game initialization
      this.selectedClass = data.selectedClass;
    }
  }

  create() {
    console.log("GameScene create() called");
    this.gameManager = new GameManager();
    this.boardManager = new BoardManager(this);
    this.spriteManager = new SpriteManager(this);
    this.inventoryManager = new InventoryManager();
    console.log("Managers initialized");

    if (!this.gameState) {
      this.gameState = this.gameManager.initializeGame(this.selectedClass);
      this.player = this.gameState.player;
    }

    this.boardManager.createBoard(this.gameState.board);
    this.createPlayer();
    this.createUI();
    this.createSkillButtons();
    this.createDiceButton();

    // Add keyboard shortcut for testing events (E key)
    this.input.keyboard?.on("keydown-E", () => {
      this.handleEventTile();
    });

    // Add keyboard shortcut for simulating turns (T key)
    this.input.keyboard?.on("keydown-T", () => {
      this.simulateTurn();
    });

    // Add keyboard shortcut for inventory (I key)
    this.input.keyboard?.on("keydown-I", () => {
      console.log("I key pressed!");
      this.toggleInventory();
    });
  }

  private createPlayer() {
    const currentTile = this.gameState.board[this.player.position];
    console.log("Creating player sprite at:", currentTile.x, currentTile.y);

    // Create sprite based on player's class
    const className = this.player.class?.name || "knight";
    try {
      switch (className) {
        case "knight":
          this.playerSprite = this.spriteManager.createKnight(
            currentTile.x,
            currentTile.y,
            1
          );
          break;
        case "archer":
          this.playerSprite = this.spriteManager.createArcher(
            currentTile.x,
            currentTile.y,
            1
          );
          break;
        case "mage":
          this.playerSprite = this.spriteManager.createMage(
            currentTile.x,
            currentTile.y,
            1
          );
          break;
        case "barbarian":
          this.playerSprite = this.spriteManager.createBarbarian(
            currentTile.x,
            currentTile.y,
            1
          );
          break;
        case "assassin":
          this.playerSprite = this.spriteManager.createAssassin(
            currentTile.x,
            currentTile.y,
            1
          );
          break;
        case "cleric":
          this.playerSprite = this.spriteManager.createCleric(
            currentTile.x,
            currentTile.y,
            1
          );
          break;
        default:
          this.playerSprite = this.spriteManager.createKnight(
            currentTile.x,
            currentTile.y,
            1
          );
      }
    } catch (error) {
      console.warn("Failed to create class sprite, using knight:", error);
      this.playerSprite = this.spriteManager.createKnight(
        currentTile.x,
        currentTile.y,
        1
      );
    }

    console.log("Player sprite created:", this.playerSprite);
  }

  private createUI() {
    const padding = 20;
    const screenWidth = this.cameras.main.width;

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

    // Add inventory button with relative positioning
    console.log("Creating inventory button in UI...");
    this.inventoryButton = this.add.text(screenWidth - 180, 20, "📦 INVENTORY", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#e74c3c",
      padding: { x: 10, y: 5 },
      fontFamily: "Arial",
    });

    this.inventoryButton.setInteractive();
    this.inventoryButton.setDepth(1000); // Ensure it's visible

    this.inventoryButton.on("pointerdown", () => {
      console.log("Inventory clicked!");
      this.toggleInventory();
    });

    this.inventoryButton.on("pointerover", () => {
      this.inventoryButton.setStyle({ backgroundColor: "#c0392b" });
    });

    this.inventoryButton.on("pointerout", () => {
      this.inventoryButton.setStyle({ backgroundColor: "#e74c3c" });
    });

    console.log(
      "Inventory button created at:",
      this.inventoryButton.x,
      this.inventoryButton.y
    );

    this.updateUI();
  }

  private createSkillButtons() {
    const skillManager = this.gameManager.getSkillManager();
    const playerSkills = this.player.skills.filter((ps) => ps.unlocked);

    const startX = this.cameras.main.width - 250;
    const startY = 100;
    const buttonHeight = 40;

    // Title
    this.add
      .text(startX, startY - 30, "SKILLS", {
        fontSize: "18px",
        color: "#ffe66d",
        fontFamily: "Courier New, monospace",
      })
      .setOrigin(0.5);

    playerSkills.forEach((playerSkill, index) => {
      const skill = skillManager.getSkill(playerSkill.skillId);
      if (!skill) return;

      const y = startY + index * buttonHeight;
      const canUse = skillManager.canUseSkill(this.player, skill.id);
      const cooldown = this.player.skillCooldowns[skill.id] || 0;

      let buttonText = skill.name;
      if (cooldown > 0) {
        buttonText += ` (${cooldown})`;
      }

      const button = this.add
        .text(startX, y, buttonText, {
          fontSize: "14px",
          color: canUse ? "#4ecdc4" : "#666666",
          fontFamily: "Courier New, monospace",
          backgroundColor: "#16213e",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5);

      if (canUse && skill.type === "active") {
        button.setInteractive();
        button.on("pointerdown", () => this.useSkill(skill.id));
        button.on("pointerover", () => {
          button.setStyle({ color: "#ff6b6b" });
          this.showSkillTooltip(skill, button.x, button.y - 30);
        });
        button.on("pointerout", () => {
          button.setStyle({ color: "#4ecdc4" });
          this.hideSkillTooltip();
        });
      }

      this.skillButtons.push(button);
    });
  }

  private showSkillTooltip(skill: any, x: number, y: number) {
    // Simple tooltip showing skill description
    this.skillTooltip = this.add
      .text(x, y, skill.description, {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#000000",
        padding: { x: 8, y: 4 },
        wordWrap: { width: 200 },
      })
      .setOrigin(0.5);
  }

  private hideSkillTooltip() {
    if (this.skillTooltip) {
      this.skillTooltip.destroy();
      this.skillTooltip = null;
    }
  }

  private useSkill(skillId: string) {
    const skillManager = this.gameManager.getSkillManager();
    const result = skillManager.useSkill(this.player, skillId);

    if (result.success) {
      this.showMessage(result.message, "#4ecdc4");
      this.updateSkillButtons();
      this.updateUI();
    } else {
      this.showMessage("Cannot use skill!", "#e74c3c");
    }
  }

  private updateSkillButtons() {
    // Destroy existing buttons
    this.skillButtons.forEach((button) => button.destroy());
    this.skillButtons = [];

    // Recreate buttons with updated cooldowns
    this.createSkillButtons();
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

    // Test shop button - positioned to the far left
    const testShopButton = this.add
      .text(centerX - 250, bottomY, "TEST SHOP", {
        fontSize: "18px",
        color: "#f39c12",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#16213e",
        padding: { x: 15, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive();

    testShopButton.on("pointerdown", () => this.testShop());
    testShopButton.on("pointerover", () =>
      testShopButton.setStyle({ color: "#ff6b6b" })
    );
    testShopButton.on("pointerout", () =>
      testShopButton.setStyle({ color: "#f39c12" })
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

    // Test floor advance button - positioned above dice button
    const testFloorButton = this.add
      .text(centerX, bottomY - 50, "ADVANCE FLOOR", {
        fontSize: "16px",
        color: "#9b59b6",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#16213e",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive();

    testFloorButton.on("pointerdown", () => this.testAdvanceFloor());
    testFloorButton.on("pointerover", () =>
      testFloorButton.setStyle({ color: "#ff6b6b" })
    );
    testFloorButton.on("pointerout", () =>
      testFloorButton.setStyle({ color: "#9b59b6" })
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
    const startingPosition = this.player.position;
    let floorAdvanced = false;
    let remainingSteps = 0;

    const moveStep = () => {
      if (currentStep < steps) {
        this.player.position = (this.player.position + 1) % boardSize;
        const tile = this.gameState.board[this.player.position];

        // Check if player passed through tile 0 (completed a loop)
        if (
          this.player.position === 0 &&
          startingPosition !== 0 &&
          !floorAdvanced
        ) {
          this.advanceFloorDuringMovement();
          floorAdvanced = true;

          // Check if this is a shop floor - if so, stop at tile 0 and open shop
          if (this.gameManager.isShopFloor(this.gameState.currentFloor)) {
            remainingSteps = steps - currentStep - 1; // Save remaining steps
            this.tweens.add({
              targets: this.playerSprite,
              x: tile.x,
              y: tile.y,
              duration: 300,
              ease: "Power2",
            });

            // Stop movement and open shop after a brief delay
            this.time.delayedCall(1000, () => {
              this.showMessage("A special shop has appeared!", "#f39c12");
              this.time.delayedCall(2000, () => {
                this.showShopMenuWithContinuation(remainingSteps);
              });
            });
            return; // Stop movement here
          }
        }

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
        // Movement complete, handle final tile event
        this.handleTileEvent();
      }
    };

    moveStep();
  }

  private handleTileEvent() {
    const currentTile = this.gameState.board[this.player.position];

    switch (currentTile.type) {
      case TileType.START:
        // Handle special shop floors at tile 0
        if (this.gameManager.isShopFloor(this.gameState.currentFloor)) {
          this.showShopMenu();
        } else {
          this.endTurn();
        }
        break;
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

    // 50% chance to also find an item
    if (Math.random() < 0.5) {
      const item = this.inventoryManager.generateRandomItem(
        this.gameState.currentFloor
      );
      const success = this.inventoryManager.addItem(this.player, item);

      if (success) {
        this.showMessage(`Found ${coins} coins and ${item.name}!`, "#ffe66d");
      } else {
        this.showMessage(
          `Found ${coins} coins! (Inventory full - item lost)`,
          "#ffe66d"
        );
      }
    } else {
      this.showMessage(`Found ${coins} coins!`, "#ffe66d");
    }

    this.endTurn();
  }

  private handleShopTile() {
    this.showShopMenu();
  }

  private showShopMenu() {
    this.showShopMenuWithContinuation(0);
  }

  private showShopMenuWithContinuation(remainingSteps: number) {
    const isSpecialShop = this.gameManager.isShopFloor(
      this.gameState.currentFloor
    );

    // Create shop background
    const shopBg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      500,
      400,
      0x16213e
    );
    shopBg.setStrokeStyle(2, isSpecialShop ? 0xf39c12 : 0x4ecdc4);

    // Shop title
    const shopTitle = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 160,
        isSpecialShop ? "SPECIAL SHOP" : "SHOP",
        {
          fontSize: "32px",
          color: isSpecialShop ? "#f39c12" : "#4ecdc4",
          fontFamily: "Courier New, monospace",
        }
      )
      .setOrigin(0.5);

    const shopItems: Phaser.GameObjects.GameObject[] = [shopBg, shopTitle];

    // Show remaining steps if any
    if (remainingSteps > 0) {
      const stepsText = this.add
        .text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 - 130,
          `${remainingSteps} steps remaining after shop`,
          {
            fontSize: "16px",
            color: "#4ecdc4",
            fontFamily: "Courier New, monospace",
          }
        )
        .setOrigin(0.5);
      shopItems.push(stepsText);
    }

    // Regular items
    const antidotePrice = 25;
    const antidoteText = this.createShopItem(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100,
      `Antidote - ${antidotePrice} coins`,
      antidotePrice,
      () => this.buyAntidote(antidotePrice)
    );
    shopItems.push(antidoteText);

    const healingPrice = 15;
    const healingText = this.createShopItem(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 60,
      `Healing Potion - ${healingPrice} coins`,
      healingPrice,
      () => this.buyHealing(healingPrice)
    );
    shopItems.push(healingText);

    // Special shop items (floors 4, 8, 12)
    if (isSpecialShop) {
      const upgradePrice = 50;
      const upgradeText = this.createShopItem(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 20,
        `Stat Upgrade - ${upgradePrice} coins`,
        upgradePrice,
        () => this.buyStatUpgrade(upgradePrice)
      );
      shopItems.push(upgradeText);

      const blessingPrice = 75;
      const blessingText = this.createShopItem(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 20,
        `Blessing Scroll - ${blessingPrice} coins`,
        blessingPrice,
        () => this.buyBlessing(blessingPrice)
      );
      shopItems.push(blessingText);

      const amuletPrice = 50;
      const amuletText = this.createShopItem(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 60,
        `Heartstone Amulet - ${amuletPrice} coins`,
        amuletPrice,
        () => this.buyAmulet(amuletPrice)
      );
      shopItems.push(amuletText);

      const armorPrice = 50;
      const armorText = this.createShopItem(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 100,
        `Heartstone Amulet - ${armorPrice} coins`,
        armorPrice,
        () => this.buyArmor(armorPrice)
      );
      shopItems.push(armorText);
    }

    // Close button
    const closeButton = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 100,
        "LEAVE SHOP",
        {
          fontSize: "18px",
          color: "#ffe66d",
          fontFamily: "Courier New, monospace",
          backgroundColor: "#16213e",
          padding: { x: 15, y: 8 },
        }
      )
      .setOrigin(0.5)
      .setInteractive();

    closeButton.on("pointerdown", () => {
      this.closeShopWithContinuation(
        shopItems.concat([closeButton]),
        remainingSteps
      );
    });
    closeButton.on("pointerover", () =>
      closeButton.setStyle({ color: "#ff6b6b" })
    );
    closeButton.on("pointerout", () =>
      closeButton.setStyle({ color: "#ffe66d" })
    );

    shopItems.push(closeButton);
  }

  private createShopItem(
    x: number,
    y: number,
    text: string,
    price: number,
    onBuy: () => void
  ): Phaser.GameObjects.Text {
    const canAfford = this.player.coins >= price;
    const itemText = this.add
      .text(x, y, text, {
        fontSize: "20px",
        color: canAfford ? "#27ae60" : "#e74c3c",
        fontFamily: "Courier New, monospace",
      })
      .setOrigin(0.5);

    if (canAfford) {
      itemText.setInteractive();
      itemText.on("pointerdown", () => {
        // Double-check affordability at purchase time
        if (this.player.coins >= price) {
          onBuy();
          this.updateUI(); // Update UI to reflect purchase
          // Show purchase confirmation
          this.showMessage(
            `Purchased! ${this.player.coins} coins remaining`,
            "#27ae60"
          );
        } else {
          // Should not happen, but safety check
          this.showMessage("Not enough coins!", "#e74c3c");
        }
      });
      itemText.on("pointerover", () => itemText.setStyle({ color: "#2ecc71" }));
      itemText.on("pointerout", () => itemText.setStyle({ color: "#27ae60" }));
    } else {
      // Make unaffordable items show "Not enough coins" when clicked
      itemText.setInteractive();
      itemText.on("pointerdown", () => {
        this.showMessage("Not enough coins!", "#e74c3c");
      });
      itemText.on("pointerover", () => itemText.setStyle({ color: "#c0392b" }));
      itemText.on("pointerout", () => itemText.setStyle({ color: "#e74c3c" }));
    }

    return itemText;
  }

  private buyStatUpgrade(price: number) {
    if (this.player.coins >= price) {
      this.player.coins -= price;
      this.gameManager.updateBaseStats(this.player, 2, 2, 10);
      this.showMessage(
        "Stats upgraded! +2 ATK, +2 DEF, +10 Max HP!",
        "#f39c12"
      );
    } else {
      this.showMessage("Not enough coins!", "#e74c3c");
    }
  }

  private buyBlessing(price: number) {
    if (this.player.coins >= price) {
      this.player.coins -= price;
      const blessingEffect = this.gameManager.createBlessingEffect();
      this.gameManager.addStatusEffect(this.player, blessingEffect);
      this.showMessage(
        "Blessing purchased! +5 to all stats for 3 turns!",
        "#f39c12"
      );
    } else {
      this.showMessage("Not enough coins!", "#e74c3c");
    }
  }

  private buyAmulet(price: number) {
    if (this.player.coins >= price) {
      this.player.coins -= price;
      this.gameManager.updateBaseStats(this.player, 0, 0, 20);
      this.showMessage("Max Health Increased! +20 Max HP!", "#f39c12");
    } else {
      this.showMessage("Not enough coins!", "#e74c3c");
    }
  }

  private buyArmor(price: number) {
    if (this.player.coins >= price) {
      this.player.coins -= price;
      this.gameManager.updateBaseStats(this.player, 0, 5, 0);
      this.showMessage("Max Health Increased! +20 Max HP!", "#f39c12");
    } else {
      this.showMessage("Not enough coins!", "#e74c3c");
    }
  }

  private buyAntidote(price: number) {
    if (this.player.coins >= price) {
      this.player.coins -= price;

      if (
        this.gameManager.hasStatusEffect(this.player, StatusEffectType.POISON)
      ) {
        this.gameManager.removeStatusEffect(
          this.player,
          StatusEffectType.POISON
        );
        const antidoteEffect = this.gameManager.createAntidoteEffect();
        this.gameManager.addStatusEffect(this.player, antidoteEffect);
        this.showMessage("Poison cured! Antidote provides healing!", "#27ae60");
      } else {
        this.player.health = Math.min(
          this.player.maxHealth,
          this.player.health + 20
        );
        this.showMessage("Not poisoned, but gained 20 HP!", "#27ae60");
      }
    } else {
      this.showMessage("Not enough coins!", "#e74c3c");
    }
  }

  private buyHealing(price: number) {
    if (this.player.coins >= price) {
      this.player.coins -= price;
      const oldHealth = this.player.health;
      this.player.health = Math.min(
        this.player.maxHealth,
        this.player.health + 25
      );
      const healed = this.player.health - oldHealth;
      this.showMessage(`Healed ${healed} HP!`, "#f39c12");
    } else {
      this.showMessage("Not enough coins!", "#e74c3c");
    }
  }

  private closeShop(elements: Phaser.GameObjects.GameObject[]) {
    elements.forEach((element) => element.destroy());
    this.endTurn();
  }

  private closeShopWithContinuation(
    elements: Phaser.GameObjects.GameObject[],
    remainingSteps: number
  ) {
    elements.forEach((element) => element.destroy());

    if (remainingSteps > 0) {
      // Continue movement with remaining steps
      this.showMessage(`Continuing with ${remainingSteps} steps...`, "#4ecdc4");
      this.time.delayedCall(1500, () => {
        this.continueMovement(remainingSteps);
      });
    } else {
      // No remaining steps, end turn
      this.endTurn();
    }
  }

  private continueMovement(steps: number) {
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
        // Movement complete, handle final tile event
        this.handleTileEvent();
      }
    };

    moveStep();
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
          this.gameManager.updateBaseStats(this.player, 3, 0, 0);
          return "Attack increased by 3!";
        },
        color: "#ff9f43",
      },
      {
        text: "Found an Armor!",
        effect: () => {
          this.gameManager.updateBaseStats(this.player, 0, 3, 0);
          return "Defense increased by 3!";
        },
        color: "#ff9f43",
      },
      {
        text: "Poisonous trap!",
        effect: () => {
          if (
            this.gameManager.hasStatusEffect(
              this.player,
              StatusEffectType.POISON
            )
          ) {
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
          if (
            this.gameManager.hasStatusEffect(
              this.player,
              StatusEffectType.BLESSING
            )
          ) {
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
          if (
            this.gameManager.hasStatusEffect(
              this.player,
              StatusEffectType.POISON
            )
          ) {
            this.gameManager.removeStatusEffect(
              this.player,
              StatusEffectType.POISON
            );
            const antidoteEffect = this.gameManager.createAntidoteEffect();
            this.gameManager.addStatusEffect(this.player, antidoteEffect);
            return "Poison cured! Antidote provides healing!";
          } else {
            this.player.health = Math.min(
              this.player.maxHealth,
              this.player.health + 15
            );
            return "Not poisoned, but gained 15 HP!";
          }
        },
        color: "#27ae60",
      },
      {
        text: "Mysterious herb!",
        effect: () => {
          if (
            this.gameManager.hasStatusEffect(
              this.player,
              StatusEffectType.POISON
            )
          ) {
            // 50% chance to cure poison
            if (Math.random() < 0.5) {
              this.gameManager.removeStatusEffect(
                this.player,
                StatusEffectType.POISON
              );
              return "The herb cured your poison!";
            } else {
              return "The herb had no effect on the poison...";
            }
          } else {
            this.player.health = Math.min(
              this.player.maxHealth,
              this.player.health + 10
            );
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
    if (this.gameManager.isFinalFloor(this.gameState.currentFloor)) {
      // Final boss encounter
      this.scene.start("CombatScene", {
        player: this.player,
        enemy: this.gameManager.generateBossEnemy(this.gameState.currentFloor),
        gameState: this.gameState,
      });
    } else {
      // Regular boss
      this.scene.start("CombatScene", {
        player: this.player,
        enemy: this.gameManager.generateEnemy(this.gameState.currentFloor),
        gameState: this.gameState,
      });
    }
  }

  private advanceFloorDuringMovement() {
    // Advance to next floor but don't stop movement
    this.gameManager.advanceFloor(this.gameState);

    // Show floor progression message briefly
    this.showMessage(
      `Floor ${this.gameState.currentFloor} reached!`,
      "#4ecdc4"
    );

    // Regenerate the board visually (but don't reset player position)
    this.boardManager.createBoard(this.gameState.board);

    // Update UI to show new floor
    this.updateUI();

    // Note: Player continues moving, no stopping here
  }

  private handleFloorProgression() {
    // Advance to next floor
    this.gameManager.advanceFloor(this.gameState);

    // Show floor progression message
    this.showMessage(
      `Floor ${this.gameState.currentFloor} reached!`,
      "#4ecdc4"
    );

    // Check if this is a shop floor
    if (this.gameManager.isShopFloor(this.gameState.currentFloor)) {
      this.time.delayedCall(2000, () => {
        this.showMessage("A special shop has appeared!", "#f39c12");
        this.time.delayedCall(2000, () => {
          this.showShopMenu();
        });
      });
    } else if (this.gameManager.isFinalFloor(this.gameState.currentFloor)) {
      this.time.delayedCall(2000, () => {
        this.showMessage("FINAL FLOOR! Only bosses remain!", "#ff0000");
        this.time.delayedCall(2000, () => {
          this.endTurn();
        });
      });
    } else {
      // Regular floor progression
      this.time.delayedCall(2000, () => {
        this.endTurn();
      });
    }

    // Regenerate the board visually
    this.boardManager.createBoard(this.gameState.board);

    // Update player sprite position
    const startTile = this.gameState.board[0];
    this.playerSprite.setPosition(startTile.x, startTile.y);

    this.updateUI();
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

    // Update skill cooldowns
    const skillManager = this.gameManager.getSkillManager();
    skillManager.updateCooldowns(this.player);

    // Show status effect messages if any
    if (statusMessages.length > 0) {
      const combinedMessage = statusMessages.join("\n");
      this.showMessage(combinedMessage, "#9b59b6");
    }

    this.updateUI();
    this.updateSkillButtons();

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
      turnMessage = `Turn simulated!\n${statusMessages.join("\n")}`;
    } else {
      turnMessage = "Turn simulated!\nNo status effects active.";
    }

    this.showMessage(turnMessage, "#e74c3c");
    this.updateUI();

    // Check if player died from poison
    if (
      this.player.health <= 1 &&
      this.gameManager.hasStatusEffect(this.player, StatusEffectType.POISON)
    ) {
      this.time.delayedCall(2000, () => {
        this.showMessage("You died from poison!", "#ff0000");
        this.time.delayedCall(2000, () => {
          this.scene.start("MenuScene");
        });
      });
    }
  }

  private testAdvanceFloor() {
    // Advance floor for testing purposes
    this.gameManager.advanceFloor(this.gameState);

    // Show floor advancement message
    this.showMessage(
      `TEST: Advanced to Floor ${this.gameState.currentFloor}!`,
      "#9b59b6"
    );

    // Regenerate the board visually
    this.boardManager.createBoard(this.gameState.board);

    // Reset player position to tile 0
    this.player.position = 0;
    const startTile = this.gameState.board[0];
    this.playerSprite.setPosition(startTile.x, startTile.y);

    // Update UI
    this.updateUI();

    // Check if this is a shop floor and show message
    if (this.gameManager.isShopFloor(this.gameState.currentFloor)) {
      this.time.delayedCall(2000, () => {
        this.showMessage(
          "This is a SHOP FLOOR! Roll dice to test shop behavior.",
          "#f39c12"
        );
      });
    } else if (this.gameManager.isFinalFloor(this.gameState.currentFloor)) {
      this.time.delayedCall(2000, () => {
        this.showMessage("FINAL FLOOR! Only bosses remain!", "#ff0000");
      });
    }
  }

  private testShop() {
    // Test shop functionality - opens special shop with all items
    this.showMessage(
      "TEST: Opening SPECIAL shop menu with all items!",
      "#f39c12"
    );

    // Delay to show the message, then open special shop
    this.time.delayedCall(1500, () => {
      this.showTestShopMenu();
    });
  }

  private showTestShopMenu() {
    // Force special shop for testing - shows ALL items
    const isSpecialShop = true; // Force special shop for testing

    // Create shop background
    const shopBg = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      500,
      450, // Slightly taller for more items
      0x16213e
    );
    shopBg.setStrokeStyle(2, 0xf39c12); // Orange border for test shop

    // Shop title
    const shopTitle = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 180,
        "TEST SPECIAL SHOP",
        {
          fontSize: "32px",
          color: "#f39c12",
          fontFamily: "Courier New, monospace",
        }
      )
      .setOrigin(0.5);

    const shopItems: Phaser.GameObjects.GameObject[] = [shopBg, shopTitle];

    // Test shop info
    const infoText = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 - 150,
        "All items available for testing",
        {
          fontSize: "16px",
          color: "#4ecdc4",
          fontFamily: "Courier New, monospace",
        }
      )
      .setOrigin(0.5);
    shopItems.push(infoText);

    // Regular items
    const antidotePrice = 25;
    const antidoteText = this.createShopItem(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 110,
      `Antidote - ${antidotePrice} coins`,
      antidotePrice,
      () => this.buyAntidote(antidotePrice)
    );
    shopItems.push(antidoteText);

    const healingPrice = 15;
    const healingText = this.createShopItem(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 70,
      `Healing Potion - ${healingPrice} coins`,
      healingPrice,
      () => this.buyHealing(healingPrice)
    );
    shopItems.push(healingText);

    // Special shop items (always show in test shop)
    const upgradePrice = 50;
    const upgradeText = this.createShopItem(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 30,
      `Stat Upgrade - ${upgradePrice} coins`,
      upgradePrice,
      () => this.buyStatUpgrade(upgradePrice)
    );
    shopItems.push(upgradeText);

    const blessingPrice = 75;
    const blessingText = this.createShopItem(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 10,
      `Blessing Scroll - ${blessingPrice} coins`,
      blessingPrice,
      () => this.buyBlessing(blessingPrice)
    );
    shopItems.push(blessingText);

    // Close button
    const closeButton = this.add
      .text(
        this.cameras.main.width / 2,
        this.cameras.main.height / 2 + 120,
        "CLOSE TEST SHOP",
        {
          fontSize: "18px",
          color: "#ffe66d",
          fontFamily: "Courier New, monospace",
          backgroundColor: "#16213e",
          padding: { x: 15, y: 8 },
        }
      )
      .setOrigin(0.5)
      .setInteractive();

    closeButton.on("pointerdown", () => {
      this.closeTestShop(shopItems.concat([closeButton]));
    });
    closeButton.on("pointerover", () =>
      closeButton.setStyle({ color: "#ff6b6b" })
    );
    closeButton.on("pointerout", () =>
      closeButton.setStyle({ color: "#ffe66d" })
    );

    shopItems.push(closeButton);
  }

  private closeTestShop(elements: Phaser.GameObjects.GameObject[]) {
    elements.forEach((element) => element.destroy());
    this.showMessage("Test shop closed!", "#f39c12");
    // Don't end turn, just close shop
  }

  private updateUI() {
    this.uiElements.health.setText(
      `Health: ${this.player.health}/${this.player.maxHealth}`
    );
    this.uiElements.coins.setText(`Coins: ${this.player.coins}`);
    this.uiElements.attack.setText(`Attack: ${this.player.attack}`);
    this.uiElements.defense.setText(`Defense: ${this.player.defense}`);
    this.uiElements.floor.setText(`Floor: ${this.gameState.currentFloor}`);

    // Show status effects with duration
    const statusTexts = this.player.statusEffects.map((effect) => {
      let statusText = "";
      switch (effect.type) {
        case StatusEffectType.POISON:
          statusText = "☠️ POISONED";
          break;
        case StatusEffectType.REGENERATION:
          statusText = "💚 HEALING";
          break;
        case StatusEffectType.BLESSING:
          statusText = "✨ BLESSED";
          break;
        default:
          statusText = effect.type.toUpperCase();
      }

      // Add duration if it's not permanent (-1)
      if (effect.duration > 0) {
        statusText += ` (${effect.duration})`;
      }

      return statusText;
    });

    this.uiElements.status.setText(statusTexts.join(" | "));

    // Show mana for mage class
    if (this.player.mana !== undefined && this.player.maxMana !== undefined) {
      if (!this.uiElements.mana) {
        this.uiElements.mana = this.add.text(20, 200, "", {
          fontSize: "18px",
          color: "#3498db",
          fontFamily: "Courier New, monospace",
        });
      }
      this.uiElements.mana.setText(
        `Mana: ${this.player.mana}/${this.player.maxMana}`
      );
    }
  }

  private toggleInventory() {
    console.log(
      "Toggle inventory called, current state:",
      this.isInventoryOpen
    );
    if (this.isInventoryOpen) {
      this.closeInventory();
    } else {
      this.openInventory();
    }
  }

  private openInventory() {
    console.log("Opening inventory...");
    this.isInventoryOpen = true;
    this.createInventoryPanel();
    this.createEquipmentPanel();
  }

  private closeInventory() {
    console.log("Closing inventory...");
    this.isInventoryOpen = false;
    if (this.inventoryPanel) {
      this.inventoryPanel.destroy();
      this.inventoryPanel = null;
    }
    if (this.equipmentPanel) {
      this.equipmentPanel.destroy();
      this.equipmentPanel = null;
    }
  }

  private createInventoryPanel() {
    const panelX = 400;
    const panelY = 300;
    const panelWidth = 500;
    const panelHeight = 400;

    this.inventoryPanel = this.add.container(panelX, panelY);

    // Background
    const bg = this.add.rectangle(
      0,
      0,
      panelWidth,
      panelHeight,
      0x2c3e50,
      0.95
    );
    bg.setStrokeStyle(2, 0x34495e);
    this.inventoryPanel?.add(bg);

    // Title
    const title = this.add.text(0, -panelHeight / 2 + 20, "Inventory", {
      fontSize: "20px",
      color: "#ffffff",
      fontFamily: "Courier New, monospace",
    });
    title.setOrigin(0.5);
    this.inventoryPanel?.add(title);

    // Close button
    const closeBtn = this.add.text(
      panelWidth / 2 - 20,
      -panelHeight / 2 + 20,
      "✕",
      {
        fontSize: "18px",
        color: "#e74c3c",
        fontFamily: "Courier New, monospace",
      }
    );
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive();
    closeBtn.on("pointerdown", () => this.closeInventory());
    this.inventoryPanel?.add(closeBtn);

    // Inventory grid
    const startX = -panelWidth / 2 + 40;
    const startY = -panelHeight / 2 + 60;
    const slotSize = 40;
    const slotsPerRow = 10;
    const rows = 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < slotsPerRow; col++) {
        const slotIndex = row * slotsPerRow + col;
        const x = startX + col * (slotSize + 5);
        const y = startY + row * (slotSize + 5);

        // Slot background
        const slot = this.add.rectangle(
          x,
          y,
          slotSize,
          slotSize,
          0x34495e,
          0.8
        );
        slot.setStrokeStyle(1, 0x7f8c8d);
        this.inventoryPanel?.add(slot);

        // Item in slot
        if (slotIndex < this.player.inventory.length) {
          const item = this.player.inventory[slotIndex];
          const itemText = this.add.text(x, y, this.getItemIcon(item.type), {
            fontSize: "16px",
            color: this.getRarityColor(item.rarity),
            fontFamily: "Courier New, monospace",
          });
          itemText.setOrigin(0.5);
          itemText.setInteractive();

          // Item tooltip and interaction
          itemText.on("pointerover", () => {
            this.showItemTooltip(item, x + panelX, y + panelY);
          });

          itemText.on("pointerout", () => {
            this.hideItemTooltip();
          });

          itemText.on("pointerdown", () => {
            this.handleItemClick(item);
          });

          this.inventoryPanel?.add(itemText);

          // Quantity indicator
          if (item.quantity > 1) {
            const quantityText = this.add.text(
              x + slotSize / 2 - 5,
              y + slotSize / 2 - 5,
              item.quantity.toString(),
              {
                fontSize: "10px",
                color: "#ffffff",
                fontFamily: "Courier New, monospace",
              }
            );
            quantityText.setOrigin(1);
            this.inventoryPanel?.add(quantityText);
          }
        }
      }
    }
  }

  private createEquipmentPanel() {
    const panelX = 100;
    const panelY = 300;
    const panelWidth = 250;
    const panelHeight = 400;

    // Ensure equipment object exists
    if (!this.player.equipment) {
      this.player.equipment = {};
    }

    this.equipmentPanel = this.add.container(panelX, panelY);

    // Background
    const bg = this.add.rectangle(
      0,
      0,
      panelWidth,
      panelHeight,
      0x2c3e50,
      0.95
    );
    bg.setStrokeStyle(2, 0x34495e);
    this.equipmentPanel?.add(bg);

    // Title
    const title = this.add.text(0, -panelHeight / 2 + 20, "Equipment", {
      fontSize: "20px",
      color: "#ffffff",
      fontFamily: "Courier New, monospace",
    });
    title.setOrigin(0.5);
    this.equipmentPanel?.add(title);

    // Equipment slots - safely access equipment with fallbacks
    const slots = [
      { name: "Helmet", item: this.player.equipment?.helmet || null, y: -120 },
      { name: "Weapon", item: this.player.equipment?.weapon || null, y: -60 },
      { name: "Armor", item: this.player.equipment?.armor || null, y: 0 },
      {
        name: "Accessory",
        item: this.player.equipment?.accessory || null,
        y: 60,
      },
      { name: "Boots", item: this.player.equipment?.boots || null, y: 120 },
    ];

    slots.forEach((slot) => {
      // Slot label
      const label = this.add.text(-80, slot.y - 20, slot.name + ":", {
        fontSize: "14px",
        color: "#bdc3c7",
        fontFamily: "Courier New, monospace",
      });
      this.equipmentPanel?.add(label);

      // Slot background
      const slotBg = this.add.rectangle(0, slot.y, 40, 40, 0x34495e, 0.8);
      slotBg.setStrokeStyle(1, 0x7f8c8d);
      this.equipmentPanel?.add(slotBg);

      // Equipped item
      if (slot.item) {
        const itemIcon = this.add.text(
          0,
          slot.y,
          this.getItemIcon(slot.item.type),
          {
            fontSize: "16px",
            color: this.getRarityColor(slot.item.rarity),
            fontFamily: "Courier New, monospace",
          }
        );
        itemIcon.setOrigin(0.5);
        itemIcon.setInteractive();

        itemIcon.on("pointerover", () => {
          this.showItemTooltip(slot.item!, panelX, slot.y + panelY);
        });

        itemIcon.on("pointerout", () => {
          this.hideItemTooltip();
        });

        itemIcon.on("pointerdown", () => {
          this.unequipItem(slot.item!);
        });

        this.equipmentPanel?.add(itemIcon);
      }
    });
  }

  private getItemIcon(itemType: string | undefined): string {
    if (!itemType) return "📦";

    switch (itemType.toLowerCase()) {
      case "weapon":
        return "⚔️";
      case "armor":
        return "�️";
      case "accessory":
        return "💍";
      case "consumable":
        return "🧪";
      case "treasure":
        return "�";
      default:
        return "📦";
    }
  }

  private getRarityColor(rarity: string | undefined): string {
    if (!rarity) return "#ffffff";

    switch (rarity.toLowerCase()) {
      case "common":
        return "#ffffff";
      case "uncommon":
        return "#2ecc71";
      case "rare":
        return "#3498db";
      case "epic":
        return "#9b59b6";
      case "legendary":
        return "#f39c12";
      default:
        return "#ffffff";
    }
  }

  private showItemTooltip(item: any, x: number, y: number) {
    this.hideItemTooltip();

    let tooltipText = `${item.name}\n`;
    tooltipText += `${item.description}\n`;
    tooltipText += `Rarity: ${item.rarity}\n`;
    tooltipText += `Value: ${item.value} coins\n`;

    if (item.attack) tooltipText += `Attack: +${item.attack}\n`;
    if (item.defense) tooltipText += `Defense: +${item.defense}\n`;
    if (item.healthBonus) tooltipText += `Health: +${item.healthBonus}\n`;
    if (item.effectValue) tooltipText += `Effect: +${item.effectValue}\n`;

    this.skillTooltip = this.add.text(x + 50, y, tooltipText, {
      fontSize: "12px",
      color: "#ffffff",
      backgroundColor: "#2c3e50",
      padding: { x: 8, y: 6 },
      fontFamily: "Courier New, monospace",
    });
    this.skillTooltip.setDepth(1000);
  }

  private hideItemTooltip() {
    if (this.skillTooltip) {
      this.skillTooltip.destroy();
      this.skillTooltip = null;
    }
  }

  private handleItemClick(item: any) {
    if (
      item.type === "weapon" ||
      item.type === "armor" ||
      item.type === "accessory"
    ) {
      this.equipItem(item);
    } else if (item.type === "consumable") {
      this.useItem(item);
    }
  }

  private equipItem(item: any) {
    const success = this.inventoryManager.equipItem(this.player, item);
    if (success) {
      this.showMessage(`Equipped ${item.name}!`, "#2ecc71");
      this.updateUI();
      this.refreshInventoryPanels();
    } else {
      this.showMessage("Cannot equip item!", "#e74c3c");
    }
  }

  private unequipItem(item: any) {
    const success = this.inventoryManager.unequipItem(this.player, item);
    if (success) {
      this.showMessage(`Unequipped ${item.name}!`, "#f39c12");
      this.updateUI();
      this.refreshInventoryPanels();
    } else {
      this.showMessage("Inventory full!", "#e74c3c");
    }
  }

  private useItem(item: any) {
    // Implement consumable item usage
    this.showMessage(`Used ${item.name}!`, "#3498db");
    this.inventoryManager.removeItem(this.player, item.id, 1);
    this.refreshInventoryPanels();
  }

  private refreshInventoryPanels() {
    if (this.isInventoryOpen) {
      this.closeInventory();
      this.openInventory();
    }
  }
}
