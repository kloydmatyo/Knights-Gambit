export class SpriteManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preloadCharacters() {
    console.log("Loading character sprites...");

    // Load individual character files with error handling
    this.scene.load.svg("knight", "assets/knight.svg");
    this.scene.load.svg("archer", "assets/archer.svg");
    this.scene.load.svg("mage", "assets/mage.svg");
    this.scene.load.svg("barbarian", "assets/barbarian.svg");
    this.scene.load.svg("assassin", "assets/assassin.svg");
    this.scene.load.svg("cleric", "assets/cleric.svg");

    // Add load event listeners for debugging
    this.scene.load.on("filecomplete", (key: string) => {
      console.log("Loaded:", key);
    });

    this.scene.load.on("loaderror", (file: any) => {
      console.error("Failed to load:", file.key, file.src);
    });
  }

  preloadEnemies() {
    console.log("Loading enemy sprites...");

    // Load individual enemy files
    this.scene.load.svg("goblin", "assets/goblin.svg");
    this.scene.load.svg("orc", "assets/orc.svg");
    this.scene.load.svg("skeleton", "assets/skeleton.svg");
    this.scene.load.svg("troll", "assets/troll.svg");
  }

  preloadAll() {
    this.preloadCharacters();
    this.preloadEnemies();
  }

  createCharacterSprite(
    x: number,
    y: number,
    characterType: CharacterType,
    scale: number = 2
  ): Phaser.GameObjects.Image {
    const sprite = this.scene.add.image(x, y, "characters");

    // Set the viewBox to show only the specific character
    const viewBoxX = this.getCharacterOffset(characterType);
    sprite.setDisplaySize(32 * scale, 32 * scale);

    // For SVG, we need to use a different approach to show specific parts
    // This would require creating separate SVG files or using a texture atlas

    return sprite;
  }

  private getCharacterOffset(characterType: CharacterType): number {
    switch (characterType) {
      case CharacterType.KNIGHT:
        return 0;
      case CharacterType.ARCHER:
        return 32;
      case CharacterType.MAGE:
        return 64;
      case CharacterType.BARBARIAN:
        return 96;
      case CharacterType.ASSASSIN:
        return 128;
      case CharacterType.CLERIC:
        return 160;
      default:
        return 0;
    }
  }

  // Create character sprites with fallback
  createCharacter(
    x: number,
    y: number,
    characterType: CharacterType,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    try {
      // Check if the texture exists
      if (this.scene.textures.exists(characterType)) {
        const sprite = this.scene.add.image(x, y, characterType);
        sprite.setScale(scale);
        return sprite;
      } else {
        console.warn(`Texture ${characterType} not found, creating fallback`);
        return this.createFallbackCharacter(x, y, characterType, scale);
      }
    } catch (error) {
      console.error(`Error creating character sprite: ${error}`);
      return this.createFallbackCharacter(x, y, characterType, scale);
    }
  }

  // Create enemy sprites with fallback
  createEnemy(
    x: number,
    y: number,
    enemyType: EnemyType,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    try {
      // Check if the texture exists
      if (this.scene.textures.exists(enemyType)) {
        const sprite = this.scene.add.image(x, y, enemyType);
        sprite.setScale(scale);
        return sprite;
      } else {
        console.warn(`Texture ${enemyType} not found, creating fallback`);
        return this.createFallbackEnemy(x, y, enemyType, scale);
      }
    } catch (error) {
      console.error(`Error creating enemy sprite: ${error}`);
      return this.createFallbackEnemy(x, y, enemyType, scale);
    }
  }

  // Helper methods for specific characters
  createKnight(
    x: number,
    y: number,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    return this.createCharacter(x, y, CharacterType.KNIGHT, scale);
  }

  createArcher(
    x: number,
    y: number,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    return this.createCharacter(x, y, CharacterType.ARCHER, scale);
  }

  createBarbarian(
    x: number,
    y: number,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    return this.createCharacter(x, y, CharacterType.BARBARIAN, scale);
  }

  createAssassin(
    x: number,
    y: number,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    return this.createCharacter(x, y, CharacterType.ASSASSIN, scale);
  }

  // Helper methods for specific enemies
  createGoblin(
    x: number,
    y: number,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.GOBLIN, scale);
  }

  createOrc(x: number, y: number, scale: number = 4): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.ORC, scale);
  }

  createSkeleton(
    x: number,
    y: number,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.SKELETON, scale);
  }

  createTroll(
    x: number,
    y: number,
    scale: number = 4
  ): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.TROLL, scale);
  }

  private createPixelCharacter(
    x: number,
    y: number,
    scale: number,
    colors: any
  ): Phaser.GameObjects.Rectangle {
    // For now, create a simple colored rectangle as placeholder
    // In a full implementation, you'd render the pixel art programmatically
    const sprite = this.scene.add.rectangle(
      x,
      y,
      32 * scale,
      32 * scale,
      colors.primary
    );
    return sprite;
  }

  private getKnightColors() {
    return {
      primary: 0xc0c0c0, // Silver armor
      secondary: 0xffd700, // Gold visor
      accent: 0x808080, // Dark armor parts
    };
  }

  private getArcherColors() {
    return {
      primary: 0x228b22, // Green tunic
      secondary: 0x8b4513, // Brown bow
      accent: 0xffdbac, // Skin tone
    };
  }

  // Fallback character creation using rectangles
  private createFallbackCharacter(
    x: number,
    y: number,
    characterType: CharacterType,
    scale: number
  ): Phaser.GameObjects.Image {
    // Create a simple colored rectangle as fallback
    const colors = this.getCharacterColors(characterType);
    const rect = this.scene.add.rectangle(
      x,
      y,
      32 * scale,
      32 * scale,
      colors.primary
    );

    // Add a simple text label
    const label = this.scene.add
      .text(x, y + 20 * scale, characterType.charAt(0).toUpperCase(), {
        fontSize: `${12 * scale}px`,
        color: "#ffffff",
        fontFamily: "Courier New, monospace",
      })
      .setOrigin(0.5);

    // Group them together and return as Image (type casting for compatibility)
    const container = this.scene.add.container(x, y, [rect, label]);
    return container as any;
  }

  private createFallbackEnemy(
    x: number,
    y: number,
    enemyType: EnemyType,
    scale: number
  ): Phaser.GameObjects.Image {
    // Create a simple colored rectangle as fallback
    const colors = this.getEnemyColors(enemyType);
    const rect = this.scene.add.rectangle(
      x,
      y,
      32 * scale,
      32 * scale,
      colors.primary
    );

    // Add a simple text label
    const label = this.scene.add
      .text(x, y + 20 * scale, enemyType.charAt(0).toUpperCase(), {
        fontSize: `${12 * scale}px`,
        color: "#ffffff",
        fontFamily: "Courier New, monospace",
      })
      .setOrigin(0.5);

    // Group them together and return as Image (type casting for compatibility)
    const container = this.scene.add.container(x, y, [rect, label]);
    return container as any;
  }

  private getCharacterColors(characterType: CharacterType) {
    switch (characterType) {
      case CharacterType.KNIGHT:
        return { primary: 0xc0c0c0 }; // Silver
      case CharacterType.ARCHER:
        return { primary: 0x228b22 }; // Green
      case CharacterType.MAGE:
        return { primary: 0x4169e1 }; // Blue
      case CharacterType.BARBARIAN:
        return { primary: 0x8b4513 }; // Brown
      case CharacterType.ASSASSIN:
        return { primary: 0x000000 }; // Black
      case CharacterType.CLERIC:
        return { primary: 0xffffff }; // White
      default:
        return { primary: 0x808080 }; // Gray
    }
  }

  private getEnemyColors(enemyType: EnemyType) {
    switch (enemyType) {
      case EnemyType.GOBLIN:
        return { primary: 0x228b22 }; // Green
      case EnemyType.ORC:
        return { primary: 0x8fbc8f }; // Gray-green
      case EnemyType.SKELETON:
        return { primary: 0xf5f5dc }; // Bone white
      case EnemyType.TROLL:
        return { primary: 0x556b2f }; // Dark green
      default:
        return { primary: 0xff4757 }; // Red
    }
  }
}

export enum CharacterType {
  KNIGHT = "knight",
  ARCHER = "archer",
  MAGE = "mage",
  BARBARIAN = "barbarian",
  ASSASSIN = "assassin",
  CLERIC = "cleric",
}

export enum EnemyType {
  GOBLIN = "goblin",
  ORC = "orc",
  SKELETON = "skeleton",
  TROLL = "troll",
}
