import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  preload() {
    // Create simple colored rectangles as placeholders for pixel art
    this.load.image('logo', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Title
    const title = this.add.text(centerX, centerY - 150, "KNIGHT'S GAMBIT", {
      fontSize: '48px',
      color: '#ff6b6b',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 100, 'Roguelike Board Game RPG', {
      fontSize: '24px',
      color: '#4ecdc4',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(centerX, centerY, 'START GAME', {
      fontSize: '32px',
      color: '#ffe66d',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#16213e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    startButton.on('pointerover', () => {
      startButton.setStyle({ color: '#ff6b6b' });
    });

    startButton.on('pointerout', () => {
      startButton.setStyle({ color: '#ffe66d' });
    });

    // Test Sprites button
    const testButton = this.add.text(centerX, centerY + 60, 'TEST SPRITES', {
      fontSize: '24px',
      color: '#4ecdc4',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#16213e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    testButton.on('pointerdown', () => {
      this.scene.start('SpriteTestScene');
    });

    testButton.on('pointerover', () => {
      testButton.setStyle({ color: '#ff6b6b' });
    });

    testButton.on('pointerout', () => {
      testButton.setStyle({ color: '#4ecdc4' });
    });

    // Instructions
    this.add.text(centerX, centerY + 120, 'Roll dice to move around the board\nFight enemies, collect treasure, and survive!', {
      fontSize: '18px',
      color: '#a8a8a8',
      fontFamily: 'Courier New, monospace',
      align: 'center'
    }).setOrigin(0.5);
  }
}