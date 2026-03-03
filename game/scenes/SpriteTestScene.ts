import * as Phaser from 'phaser';
import { SpriteManager, CharacterType, EnemyType } from '../managers/SpriteManager';

export class SpriteTestScene extends Phaser.Scene {
  private spriteManager!: SpriteManager;

  constructor() {
    super({ key: 'SpriteTestScene' });
  }

  preload() {
    console.log('SpriteTestScene: Loading sprites...');
    this.spriteManager = new SpriteManager(this);
    this.spriteManager.preloadAll();
  }

  create() {
    console.log('SpriteTestScene: Creating test sprites...');
    
    // Background
    this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      this.cameras.main.width, this.cameras.main.height, 0x1a1a2e);

    // Title
    this.add.text(this.cameras.main.width / 2, 50, 'SPRITE TEST', {
      fontSize: '32px',
      color: '#ff6b6b',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Test characters
    let x = 150;
    const y = 200;
    const spacing = 120;

    try {
      // Knight
      const knight = this.spriteManager.createKnight(x, y, 2);
      this.add.text(x, y + 80, 'Knight', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New, monospace'
      }).setOrigin(0.5);
      x += spacing;

      // Archer
      const archer = this.spriteManager.createArcher(x, y, 2);
      this.add.text(x, y + 80, 'Archer', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New, monospace'
      }).setOrigin(0.5);
      x += spacing;

    } catch (error) {
      console.error('Error creating character sprites:', error);
    }

    // Test enemies
    x = 150;
    const enemyY = 350;

    try {
      // Goblin
      const goblin = this.spriteManager.createGoblin(x, enemyY, 2);
      this.add.text(x, enemyY + 80, 'Goblin', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New, monospace'
      }).setOrigin(0.5);
      x += spacing;

      // Orc
      const orc = this.spriteManager.createOrc(x, enemyY, 2);
      this.add.text(x, enemyY + 80, 'Orc', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New, monospace'
      }).setOrigin(0.5);
      x += spacing;

      // Skeleton
      const skeleton = this.spriteManager.createSkeleton(x, enemyY, 2);
      this.add.text(x, enemyY + 80, 'Skeleton', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New, monospace'
      }).setOrigin(0.5);
      x += spacing;

      // Troll
      const troll = this.spriteManager.createTroll(x, enemyY, 2);
      this.add.text(x, enemyY + 80, 'Troll', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Courier New, monospace'
      }).setOrigin(0.5);

    } catch (error) {
      console.error('Error creating enemy sprites:', error);
    }

    // Back button
    const backButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 80, 'BACK TO MENU', {
      fontSize: '24px',
      color: '#ffe66d',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#16213e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    backButton.on('pointerover', () => {
      backButton.setStyle({ color: '#ff6b6b' });
    });

    backButton.on('pointerout', () => {
      backButton.setStyle({ color: '#ffe66d' });
    });
  }
}