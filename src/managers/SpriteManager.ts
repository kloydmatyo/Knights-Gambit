export class SpriteManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  preloadCharacters() {
    // Load the character spritesheet
    this.scene.load.svg('characters', 'assets/characters.svg', { width: 192, height: 32 });
    
    // Load individual character files
    this.scene.load.svg('knight', 'assets/knight.svg');
    this.scene.load.svg('archer', 'assets/archer.svg');
    this.scene.load.svg('mage', 'assets/mage.svg');
    this.scene.load.svg('barbarian', 'assets/barbarian.svg');
    this.scene.load.svg('assassin', 'assets/assassin.svg');
    this.scene.load.svg('cleric', 'assets/cleric.svg');
  }

  preloadEnemies() {
    // Load the enemy spritesheet
    this.scene.load.svg('enemies', 'assets/enemies.svg', { width: 128, height: 32 });
    
    // Load individual enemy files
    this.scene.load.svg('goblin', 'assets/goblin.svg');
    this.scene.load.svg('orc', 'assets/orc.svg');
    this.scene.load.svg('skeleton', 'assets/skeleton.svg');
    this.scene.load.svg('troll', 'assets/troll.svg');
  }

  preloadAll() {
    this.preloadCharacters();
    this.preloadEnemies();
  }

  createCharacterSprite(x: number, y: number, characterType: CharacterType, scale: number = 2): Phaser.GameObjects.Image {
    const sprite = this.scene.add.image(x, y, 'characters');
    
    // Set the viewBox to show only the specific character
    const viewBoxX = this.getCharacterOffset(characterType);
    sprite.setDisplaySize(32 * scale, 32 * scale);
    
    // For SVG, we need to use a different approach to show specific parts
    // This would require creating separate SVG files or using a texture atlas
    
    return sprite;
  }

  private getCharacterOffset(characterType: CharacterType): number {
    switch (characterType) {
      case CharacterType.KNIGHT: return 0;
      case CharacterType.ARCHER: return 32;
      case CharacterType.MAGE: return 64;
      case CharacterType.BARBARIAN: return 96;
      case CharacterType.ASSASSIN: return 128;
      case CharacterType.CLERIC: return 160;
      default: return 0;
    }
  }

  // Create character sprites
  createCharacter(x: number, y: number, characterType: CharacterType, scale: number = 4): Phaser.GameObjects.Image {
    const sprite = this.scene.add.image(x, y, characterType);
    sprite.setScale(scale);
    return sprite;
  }

  // Create enemy sprites
  createEnemy(x: number, y: number, enemyType: EnemyType, scale: number = 4): Phaser.GameObjects.Image {
    const sprite = this.scene.add.image(x, y, enemyType);
    sprite.setScale(scale);
    return sprite;
  }

  // Helper methods for specific characters
  createKnight(x: number, y: number, scale: number = 4): Phaser.GameObjects.Image {
    return this.createCharacter(x, y, CharacterType.KNIGHT, scale);
  }

  createArcher(x: number, y: number, scale: number = 4): Phaser.GameObjects.Image {
    return this.createCharacter(x, y, CharacterType.ARCHER, scale);
  }

  // Helper methods for specific enemies
  createGoblin(x: number, y: number, scale: number = 4): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.GOBLIN, scale);
  }

  createOrc(x: number, y: number, scale: number = 4): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.ORC, scale);
  }

  createSkeleton(x: number, y: number, scale: number = 4): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.SKELETON, scale);
  }

  createTroll(x: number, y: number, scale: number = 4): Phaser.GameObjects.Image {
    return this.createEnemy(x, y, EnemyType.TROLL, scale);
  }

  private createPixelCharacter(x: number, y: number, scale: number, colors: any): Phaser.GameObjects.Rectangle {
    // For now, create a simple colored rectangle as placeholder
    // In a full implementation, you'd render the pixel art programmatically
    const sprite = this.scene.add.rectangle(x, y, 32 * scale, 32 * scale, colors.primary);
    return sprite;
  }

  private getKnightColors() {
    return {
      primary: 0xC0C0C0, // Silver armor
      secondary: 0xFFD700, // Gold visor
      accent: 0x808080 // Dark armor parts
    };
  }

  private getArcherColors() {
    return {
      primary: 0x228B22, // Green tunic
      secondary: 0x8B4513, // Brown bow
      accent: 0xFFDBAC // Skin tone
    };
  }
}

export enum CharacterType {
  KNIGHT = 'knight',
  ARCHER = 'archer',
  MAGE = 'mage',
  BARBARIAN = 'barbarian',
  ASSASSIN = 'assassin',
  CLERIC = 'cleric'
}

export enum EnemyType {
  GOBLIN = 'goblin',
  ORC = 'orc',
  SKELETON = 'skeleton',
  TROLL = 'troll'
}