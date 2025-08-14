import Phaser from "phaser";
import { CharacterClass, CharacterClassName } from "../types/GameTypes";
import { SpriteManager } from "../managers/SpriteManager";

export class ClassSelectionScene extends Phaser.Scene {
  private spriteManager!: SpriteManager;
  private selectedClass: CharacterClass | null = null;
  private classCards: Phaser.GameObjects.Container[] = [];
  private confirmButton!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "ClassSelectionScene" });
  }

  preload() {
    // Load sprites
    this.spriteManager = new SpriteManager(this);
    this.spriteManager.preloadAll();
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Title
    this.add.text(centerX, 80, "CHOOSE YOUR CLASS", {
      fontSize: "48px",
      color: "#ff6b6b",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 130, "Each class has unique stats and abilities", {
      fontSize: "20px",
      color: "#4ecdc4",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);

    // Create class cards
    this.createClassCards();

    // Confirm button (initially disabled)
    this.confirmButton = this.add.text(centerX, centerY + 200, "SELECT A CLASS", {
      fontSize: "24px",
      color: "#666666",
      fontFamily: "Courier New, monospace",
      backgroundColor: "#2c2c2c",
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.text(100, 50, "← BACK TO MENU", {
      fontSize: "18px",
      color: "#4ecdc4",
      fontFamily: "Courier New, monospace",
      backgroundColor: "#16213e",
      padding: { x: 15, y: 8 },
    }).setOrigin(0.5).setInteractive();

    backButton.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    backButton.on("pointerover", () => backButton.setStyle({ color: "#ff6b6b" }));
    backButton.on("pointerout", () => backButton.setStyle({ color: "#4ecdc4" }));
  }

  private createClassCards() {
    const classes = this.getCharacterClasses();
    const cardWidth = 200;
    const cardHeight = 280;
    const spacing = 220;
    const startX = this.cameras.main.width / 2 - (spacing * (classes.length - 1)) / 2;
    const cardY = this.cameras.main.height / 2 - 20;

    classes.forEach((characterClass, index) => {
      const cardX = startX + index * spacing;
      const card = this.createClassCard(cardX, cardY, characterClass, cardWidth, cardHeight);
      this.classCards.push(card);
    });
  }

  private createClassCard(x: number, y: number, characterClass: CharacterClass, width: number, height: number): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, width, height, 0x16213e);
    bg.setStrokeStyle(2, 0x4ecdc4);
    card.add(bg);

    // Character sprite
    let sprite: Phaser.GameObjects.Image;
    try {
      // Use the specific character creation methods
      switch (characterClass.sprite) {
        case "knight":
          sprite = this.spriteManager.createKnight(0, -80, 2);
          break;
        case "archer":
          sprite = this.spriteManager.createArcher(0, -80, 2);
          break;
        case "barbarian":
          sprite = this.spriteManager.createBarbarian(0, -80, 2);
          break;
        case "assassin":
          sprite = this.spriteManager.createAssassin(0, -80, 2);
          break;
        default:
          sprite = this.spriteManager.createKnight(0, -80, 2);
      }
    } catch (error) {
      // Fallback to colored rectangle if sprite fails
      sprite = this.add.rectangle(0, -80, 60, 60, this.getClassColor(characterClass.name)) as any;
    }
    card.add(sprite);

    // Class name
    const nameText = this.add.text(0, -20, characterClass.name.toUpperCase(), {
      fontSize: "20px",
      color: "#ffe66d",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);
    card.add(nameText);

    // Stats
    const statsText = this.add.text(0, 10, 
      `HP: ${characterClass.baseHealth}\\n` +
      `ATK: ${characterClass.baseAttack}\\n` +
      `DEF: ${characterClass.baseDefense}\\n` +
      `Coins: ${characterClass.startingCoins}`, {
      fontSize: "14px",
      color: "#ffffff",
      fontFamily: "Courier New, monospace",
      align: "center",
    }).setOrigin(0.5);
    card.add(statsText);

    // Description
    const descText = this.add.text(0, 70, characterClass.description, {
      fontSize: "12px",
      color: "#a8a8a8",
      fontFamily: "Courier New, monospace",
      align: "center",
      wordWrap: { width: width - 20 },
    }).setOrigin(0.5);
    card.add(descText);

    // Special ability
    const abilityText = this.add.text(0, 110, `Special: ${characterClass.specialAbility}`, {
      fontSize: "11px",
      color: "#f39c12",
      fontFamily: "Courier New, monospace",
      align: "center",
      wordWrap: { width: width - 20 },
    }).setOrigin(0.5);
    card.add(abilityText);

    // Make card interactive
    bg.setInteractive();
    bg.on("pointerdown", () => this.selectClass(characterClass, card));
    bg.on("pointerover", () => {
      bg.setStrokeStyle(3, 0xff6b6b);
      card.setScale(1.05);
    });
    bg.on("pointerout", () => {
      if (this.selectedClass !== characterClass) {
        bg.setStrokeStyle(2, 0x4ecdc4);
        card.setScale(1);
      }
    });

    return card;
  }

  private selectClass(characterClass: CharacterClass, card: Phaser.GameObjects.Container) {
    // Deselect previous class
    this.classCards.forEach((c, index) => {
      const bg = c.list[0] as Phaser.GameObjects.Rectangle;
      bg.setStrokeStyle(2, 0x4ecdc4);
      c.setScale(1);
    });

    // Select new class
    this.selectedClass = characterClass;
    const bg = card.list[0] as Phaser.GameObjects.Rectangle;
    bg.setStrokeStyle(3, 0xff6b6b);
    card.setScale(1.05);

    // Enable confirm button
    this.confirmButton.setText("START ADVENTURE");
    this.confirmButton.setStyle({ color: "#ffe66d", backgroundColor: "#16213e" });
    this.confirmButton.setInteractive();

    this.confirmButton.off("pointerdown");
    this.confirmButton.on("pointerdown", () => {
      if (this.selectedClass) {
        this.scene.start("GameScene", { selectedClass: this.selectedClass });
      }
    });

    this.confirmButton.on("pointerover", () => this.confirmButton.setStyle({ color: "#ff6b6b" }));
    this.confirmButton.on("pointerout", () => this.confirmButton.setStyle({ color: "#ffe66d" }));
  }

  private getCharacterClasses(): CharacterClass[] {
    return [
      {
        name: CharacterClassName.KNIGHT,
        description: "Balanced warrior with strong defense and moderate attack",
        baseHealth: 120,
        baseAttack: 15,
        baseDefense: 8,
        startingCoins: 50,
        specialAbility: "Shield Block - Reduce damage by 2",
        sprite: "knight",
      },
      {
        name: CharacterClassName.ARCHER,
        description: "Agile ranged fighter with high attack but low defense",
        baseHealth: 90,
        baseAttack: 20,
        baseDefense: 3,
        startingCoins: 60,
        specialAbility: "Precise Shot - 20% crit chance",
        sprite: "archer",
      },
      {
        name: CharacterClassName.BARBARIAN,
        description: "Mighty warrior with massive health and devastating attacks",
        baseHealth: 150,
        baseAttack: 18,
        baseDefense: 5,
        startingCoins: 30,
        specialAbility: "Berserker Rage - +5 ATK when below 50% HP",
        sprite: "barbarian",
      },
      {
        name: CharacterClassName.ASSASSIN,
        description: "Stealthy fighter with high crit chance and evasion",
        baseHealth: 80,
        baseAttack: 16,
        baseDefense: 4,
        startingCoins: 70,
        specialAbility: "Shadow Strike - 30% chance to avoid damage",
        sprite: "assassin",
      },
    ];
  }

  private getClassColor(className: string): number {
    switch (className) {
      case CharacterClassName.KNIGHT: return 0x4ecdc4;
      case CharacterClassName.ARCHER: return 0x2ecc71;
      case CharacterClassName.BARBARIAN: return 0xe74c3c;
      case CharacterClassName.ASSASSIN: return 0x9b59b6;
      default: return 0x95a5a6;
    }
  }
}