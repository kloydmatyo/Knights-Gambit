import Phaser from "phaser";
import { CharacterClass, CharacterClassName } from "../types/GameTypes";
import { SpriteManager } from "../managers/SpriteManager";

export class ClassSelectionScene extends Phaser.Scene {
  private spriteManager!: SpriteManager;
  private selectedClass: CharacterClass | null = null;
  private classIcons: Phaser.GameObjects.Container[] = [];
  private detailsPanel: Phaser.GameObjects.Container | null = null;
  private confirmButton!: Phaser.GameObjects.Text;
  private instructionElements: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "ClassSelectionScene" });
  }

  preload() {
    // Load sprites
    this.spriteManager = new SpriteManager(this);
    this.spriteManager.preloadAll();
  }

  create() {
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    // Title
    this.add
      .text(screenWidth / 2, 60, "⚔️ CHARACTER SELECTION ⚔️", {
        fontSize: "42px",
        color: "#ff6b6b",
        fontFamily: "Courier New, monospace",
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(screenWidth / 2, 110, "Click on a class to view details", {
        fontSize: "18px",
        color: "#4ecdc4",
        fontFamily: "Courier New, monospace",
      })
      .setOrigin(0.5);

    // Create class selection grid (left side)
    this.createClassGrid();

    // Create initial instruction panel (right side)
    this.createInstructionPanel();

    // Confirm button (bottom center)
    this.confirmButton = this.add
      .text(screenWidth / 2, screenHeight - 80, "SELECT A CLASS FIRST", {
        fontSize: "20px",
        color: "#666666",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#2c2c2c",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5);

    // Back button
    const backButton = this.add
      .text(80, 40, "← BACK", {
        fontSize: "16px",
        color: "#4ecdc4",
        fontFamily: "Courier New, monospace",
        backgroundColor: "#16213e",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive();

    backButton.on("pointerdown", () => {
      this.scene.start("MenuScene");
    });

    backButton.on("pointerover", () =>
      backButton.setStyle({ color: "#ff6b6b" })
    );
    backButton.on("pointerout", () =>
      backButton.setStyle({ color: "#4ecdc4" })
    );
  }

  private createClassGrid() {
    const classes = this.getCharacterClasses();
    const iconSize = 120;
    const spacing = 140;
    const classesPerRow = 3;
    
    // Position grid on left side of screen
    const gridStartX = 200;
    const gridStartY = 200;

    classes.forEach((characterClass, index) => {
      const row = Math.floor(index / classesPerRow);
      const col = index % classesPerRow;
      const iconX = gridStartX + col * spacing;
      const iconY = gridStartY + row * spacing;

      const icon = this.createClassIcon(iconX, iconY, characterClass, iconSize);
      this.classIcons.push(icon);
    });
  }

  private createInstructionPanel() {
    const panelX = 850;
    const panelY = 440;
    const panelWidth = 500;
    const panelHeight = 600;

    // Create instruction panel background
    const instructionBg = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0x16213e);
    instructionBg.setStrokeStyle(3, 0x4ecdc4);

    // Instruction text
    const instructionText = this.add.text(panelX, panelY - 200, "📜 CLASS DETAILS", {
      fontSize: "28px",
      color: "#ffe66d",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);

    const helpText = this.add.text(panelX, panelY - 100, 
      "Click on any class icon to view:\n\n" +
      "• Complete stat breakdown\n" +
      "• All 3 unique skills\n" +
      "• Skill descriptions & effects\n" +
      "• Class strengths & playstyle\n\n" +
      "Choose wisely, adventurer!", {
      fontSize: "16px",
      color: "#a8a8a8",
      fontFamily: "Courier New, monospace",
      align: "center",
      lineSpacing: 8,
    }).setOrigin(0.5);

    // Store instruction elements for later removal
    this.instructionElements = [instructionBg, instructionText, helpText];
  }

  private createClassIcon(
    x: number,
    y: number,
    characterClass: CharacterClass,
    size: number
  ): Phaser.GameObjects.Container {
    const icon = this.add.container(x, y);

    // Icon background
    const bg = this.add.rectangle(0, 0, size, size, 0x16213e);
    bg.setStrokeStyle(3, this.getClassColor(characterClass.name));
    icon.add(bg);

    // Character sprite
    let sprite: Phaser.GameObjects.Image;
    try {
      switch (characterClass.sprite) {
        case "knight":
          sprite = this.spriteManager.createKnight(0, -10, 2.5);
          break;
        case "archer":
          sprite = this.spriteManager.createArcher(0, -10, 2.5);
          break;
        case "mage":
          sprite = this.spriteManager.createMage(0, -10, 2.5);
          break;
        case "barbarian":
          sprite = this.spriteManager.createBarbarian(0, -10, 2.5);
          break;
        case "assassin":
          sprite = this.spriteManager.createAssassin(0, -10, 2.5);
          break;
        case "cleric":
          sprite = this.spriteManager.createCleric(0, -10, 2.5);
          break;
        default:
          sprite = this.spriteManager.createKnight(0, -10, 2.5);
      }
    } catch (error) {
      sprite = this.add.rectangle(0, -10, 60, 60, this.getClassColor(characterClass.name)) as any;
    }
    icon.add(sprite);

    // Class name
    const nameText = this.add.text(0, 35, characterClass.name.toUpperCase(), {
      fontSize: "14px",
      color: "#ffe66d",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);
    icon.add(nameText);

    // Class emoji
    const emoji = this.getClassEmoji(characterClass.name);
    const emojiText = this.add.text(-40, -40, emoji, {
      fontSize: "24px",
    }).setOrigin(0.5);
    icon.add(emojiText);

    // Make icon interactive
    bg.setInteractive();
    bg.on("pointerdown", () => this.selectClass(characterClass, icon));
    bg.on("pointerover", () => {
      bg.setStrokeStyle(4, 0xff6b6b);
      icon.setScale(1.1);
    });
    bg.on("pointerout", () => {
      if (this.selectedClass !== characterClass) {
        bg.setStrokeStyle(3, this.getClassColor(characterClass.name));
        icon.setScale(1);
      }
    });

    return icon;
  }

  private selectClass(
    characterClass: CharacterClass,
    icon: Phaser.GameObjects.Container
  ) {
    // Deselect previous class
    this.classIcons.forEach((c) => {
      const bg = c.list[0] as Phaser.GameObjects.Rectangle;
      const className = this.getCharacterClasses().find(cls => 
        c.list.some(item => item instanceof Phaser.GameObjects.Text && 
          item.text === cls.name.toUpperCase())
      )?.name || "knight";
      bg.setStrokeStyle(3, this.getClassColor(className));
      c.setScale(1);
    });

    // Select new class
    this.selectedClass = characterClass;
    const bg = icon.list[0] as Phaser.GameObjects.Rectangle;
    bg.setStrokeStyle(4, 0xff6b6b);
    icon.setScale(1.1);

    // Remove instruction panel and create details panel
    this.removeInstructionPanel();
    this.createDetailsPanel(characterClass);

    // Enable confirm button
    this.confirmButton.setText("🗡️ START ADVENTURE 🗡️");
    this.confirmButton.setStyle({
      color: "#ffe66d",
      backgroundColor: "#16213e",
    });
    this.confirmButton.setInteractive();

    this.confirmButton.off("pointerdown");
    this.confirmButton.on("pointerdown", () => {
      if (this.selectedClass) {
        this.scene.start("GameScene", { selectedClass: this.selectedClass });
      }
    });

    this.confirmButton.on("pointerover", () =>
      this.confirmButton.setStyle({ color: "#ff6b6b" })
    );
    this.confirmButton.on("pointerout", () =>
      this.confirmButton.setStyle({ color: "#ffe66d" })
    );
  }

  private getClassEmoji(className: string): string {
    switch (className) {
      case CharacterClassName.KNIGHT: return "🛡️";
      case CharacterClassName.ARCHER: return "🏹";
      case CharacterClassName.MAGE: return "🔮";
      case CharacterClassName.BARBARIAN: return "⚔️";
      case CharacterClassName.ASSASSIN: return "🗡️";
      case CharacterClassName.CLERIC: return "✨";
      default: return "⚔️";
    }
  }

  private removeInstructionPanel() {
    this.instructionElements.forEach(element => element.destroy());
    this.instructionElements = [];
  }

  private createDetailsPanel(characterClass: CharacterClass) {
    // Remove existing details panel
    if (this.detailsPanel) {
      this.detailsPanel.destroy();
    }

    const panelX = 850;
    const panelY = 440;
    const panelWidth = 500;
    const panelHeight = 650;

    this.detailsPanel = this.add.container(panelX, panelY);

    // Panel background
    const bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x16213e);
    bg.setStrokeStyle(3, this.getClassColor(characterClass.name));
    this.detailsPanel.add(bg);

    // Class header
    const emoji = this.getClassEmoji(characterClass.name);
    const header = this.add.text(0, -280, `${emoji} ${characterClass.name.toUpperCase()} ${emoji}`, {
      fontSize: "32px",
      color: "#ffe66d",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);
    this.detailsPanel.add(header);

    // Description
    const description = this.add.text(0, -230, characterClass.description, {
      fontSize: "16px",
      color: "#a8a8a8",
      fontFamily: "Courier New, monospace",
      align: "center",
      wordWrap: { width: panelWidth - 40 },
    }).setOrigin(0.5);
    this.detailsPanel.add(description);

    // Stats section
    const statsTitle = this.add.text(0, -170, "📊 STATS", {
      fontSize: "20px",
      color: "#4ecdc4",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);
    this.detailsPanel.add(statsTitle);

    const statsText = this.add.text(0, -130, 
      `Health: ${characterClass.baseHealth} HP\n` +
      `Attack: ${characterClass.baseAttack} ATK\n` +
      `Defense: ${characterClass.baseDefense} DEF\n` +
      `Starting Coins: ${characterClass.startingCoins}\n` +
      (characterClass.baseMana ? `Mana: ${characterClass.baseMana} MP` : ""), {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "Courier New, monospace",
      align: "center",
      lineSpacing: 4,
    }).setOrigin(0.5);
    this.detailsPanel.add(statsText);

    // Skills section
    const skillsTitle = this.add.text(0, -40, "⚡ CLASS SKILLS", {
      fontSize: "20px",
      color: "#f39c12",
      fontFamily: "Courier New, monospace",
    }).setOrigin(0.5);
    this.detailsPanel.add(skillsTitle);

    // Get skills from SkillManager
    const skills = this.getClassSkills(characterClass.name as CharacterClassName);
    let skillY = 10;

    skills.forEach((skill, index) => {
      const skillName = this.add.text(-220, skillY, `${index + 1}. ${skill.name}`, {
        fontSize: "14px",
        color: "#ffe66d",
        fontFamily: "Courier New, monospace",
      });
      this.detailsPanel!.add(skillName);

      const skillType = this.add.text(-220, skillY + 20, `Type: ${skill.type.toUpperCase()}`, {
        fontSize: "12px",
        color: skill.type === "active" ? "#2ecc71" : "#9b59b6",
        fontFamily: "Courier New, monospace",
      });
      this.detailsPanel!.add(skillType);

      const skillDesc = this.add.text(-220, skillY + 40, skill.description, {
        fontSize: "11px",
        color: "#a8a8a8",
        fontFamily: "Courier New, monospace",
        wordWrap: { width: 440 },
      });
      this.detailsPanel!.add(skillDesc);

      const cooldownText = skill.cooldown > 0 ? `Cooldown: ${skill.cooldown} turns` : "Always Active";
      const cooldown = this.add.text(-220, skillY + 80, cooldownText, {
        fontSize: "10px",
        color: "#4ecdc4",
        fontFamily: "Courier New, monospace",
      });
      this.detailsPanel!.add(cooldown);

      skillY += 110;
    });
  }

  private getClassSkills(className: CharacterClassName) {
    // Define skills for each class (simplified version)
    const skillsData = {
      [CharacterClassName.KNIGHT]: [
        { name: "Shield Wall", type: "active", description: "Blocks next 3 attacks and reflects 50% damage back to attackers", cooldown: 5 },
        { name: "Guardian's Resolve", type: "passive", description: "Gains +3 Defense per defeated ally", cooldown: 0 },
        { name: "Righteous Strike", type: "active", description: "200% weapon damage with 30% stun chance, +50% vs evil", cooldown: 4 }
      ],
      [CharacterClassName.ARCHER]: [
        { name: "Piercing Shot", type: "active", description: "Arrow pierces through 3 enemies, ignoring armor", cooldown: 3 },
        { name: "Hunter's Mark", type: "passive", description: "+100% crit chance vs enemies below 50% HP", cooldown: 0 },
        { name: "Explosive Arrow", type: "active", description: "150% damage to target, 75% to adjacent, applies burn", cooldown: 5 }
      ],
      [CharacterClassName.MAGE]: [
        { name: "Arcane Missiles", type: "active", description: "5 auto-targeting missiles with escalating damage", cooldown: 4 },
        { name: "Mana Shield", type: "passive", description: "Damage absorbed by mana at 2:1 ratio", cooldown: 0 },
        { name: "Elemental Mastery", type: "active", description: "Cycles Fire/Ice/Lightning with unique effects", cooldown: 3 }
      ],
      [CharacterClassName.BARBARIAN]: [
        { name: "Berserker Rage", type: "active", description: "+100% damage, +50% resistance, extra attack for 4 turns", cooldown: 6 },
        { name: "Bloodthirst", type: "passive", description: "Heal 25% HP on kill, +5 ATK per kill (stacks)", cooldown: 0 },
        { name: "Earthquake Slam", type: "active", description: "150% damage to all enemies, 40% knockdown chance", cooldown: 5 }
      ],
      [CharacterClassName.ASSASSIN]: [
        { name: "Shadow Step", type: "active", description: "Become untargetable, next attack deals 300% critical damage", cooldown: 4 },
        { name: "Poison Mastery", type: "passive", description: "35% poison chance, +25% damage vs poisoned enemies", cooldown: 0 },
        { name: "Thousand Cuts", type: "active", description: "5 escalating attacks, final crit if all connect", cooldown: 6 }
      ],
      [CharacterClassName.CLERIC]: [
        { name: "Divine Healing", type: "active", description: "Heal based on missing HP, removes all debuffs", cooldown: 3 },
        { name: "Blessed Aura", type: "passive", description: "Party-wide regen and defense, doubles when critical", cooldown: 0 },
        { name: "Wrath of Heaven", type: "active", description: "AoE holy damage that heals allies", cooldown: 5 }
      ]
    };

    return skillsData[className] || [];
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
        specialAbility: "Shield Wall, Guardian's Resolve, Righteous Strike",
        sprite: "knight",
        skills: [], // Will be populated by SkillManager
      },
      {
        name: CharacterClassName.ARCHER,
        description: "Agile ranged fighter with high attack but low defense",
        baseHealth: 90,
        baseAttack: 20,
        baseDefense: 3,
        startingCoins: 60,
        specialAbility: "Piercing Shot, Hunter's Mark, Explosive Arrow",
        sprite: "archer",
        skills: [], // Will be populated by SkillManager
      },
      {
        name: CharacterClassName.MAGE,
        description: "Glass-cannon spellcaster with elemental magic",
        baseHealth: 70,
        baseAttack: 12,
        baseDefense: 2,
        startingCoins: 40,
        specialAbility: "Arcane Missiles, Mana Shield, Elemental Mastery",
        sprite: "mage",
        skills: [], // Will be populated by SkillManager
        baseMana: 100,
      },
      {
        name: CharacterClassName.BARBARIAN,
        description:
          "Mighty warrior with massive health and devastating attacks",
        baseHealth: 150,
        baseAttack: 18,
        baseDefense: 5,
        startingCoins: 30,
        specialAbility: "Berserker Rage, Bloodthirst, Earthquake Slam",
        sprite: "barbarian",
        skills: [], // Will be populated by SkillManager
      },
      {
        name: CharacterClassName.ASSASSIN,
        description: "Stealthy fighter with high crit chance and evasion",
        baseHealth: 80,
        baseAttack: 16,
        baseDefense: 4,
        startingCoins: 70,
        specialAbility: "Shadow Step, Poison Mastery, Thousand Cuts",
        sprite: "assassin",
        skills: [], // Will be populated by SkillManager
      },
      {
        name: CharacterClassName.CLERIC,
        description: "Divine support with healing and protective magic",
        baseHealth: 100,
        baseAttack: 10,
        baseDefense: 6,
        startingCoins: 45,
        specialAbility: "Divine Healing, Blessed Aura, Wrath of Heaven",
        sprite: "cleric",
        skills: [], // Will be populated by SkillManager
      },
    ];
  }

  private getClassColor(className: string): number {
    switch (className) {
      case CharacterClassName.KNIGHT:
        return 0x4ecdc4;
      case CharacterClassName.ARCHER:
        return 0x2ecc71;
      case CharacterClassName.MAGE:
        return 0x3498db;
      case CharacterClassName.BARBARIAN:
        return 0xe74c3c;
      case CharacterClassName.ASSASSIN:
        return 0x9b59b6;
      case CharacterClassName.CLERIC:
        return 0xf39c12;
      default:
        return 0x95a5a6;
    }
  }
}
