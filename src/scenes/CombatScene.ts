import Phaser from 'phaser';
import { Player, Enemy, GameState } from '../types/GameTypes';
import { SpriteManager, CharacterType, EnemyType } from '../managers/SpriteManager';

export class CombatScene extends Phaser.Scene {
  private player!: Player;
  private enemy!: Enemy;
  private gameState!: GameState;
  private spriteManager!: SpriteManager;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private uiElements: { [key: string]: Phaser.GameObjects.Text } = {};
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private isPlayerTurn = true;

  constructor() {
    super({ key: 'CombatScene' });
  }

  preload() {
    // Load all sprites
    this.spriteManager = new SpriteManager(this);
    this.spriteManager.preloadAll();
  }

  init(data: any) {
    this.player = data.player;
    this.enemy = data.enemy;
    this.gameState = data.gameState;
  }

  create() {
    this.spriteManager = new SpriteManager(this);
    
    // Background
    this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      this.cameras.main.width, this.cameras.main.height, 0x0f0f23);

    // Title
    this.add.text(this.cameras.main.width / 2, 50, 'COMBAT', {
      fontSize: '32px',
      color: '#ff6b6b',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    this.createCombatants();
    this.createUI();
    this.createActionButtons();
  }

  private createCombatants() {
    // Player sprite (left side)
    this.playerSprite = this.spriteManager.createKnight(200, 300, 2);
    this.add.text(200, 380, this.player.name || 'Knight', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Enemy sprite (right side)
    const enemyType = this.getEnemyType(this.enemy.name);
    this.enemySprite = this.spriteManager.createEnemy(800, 300, enemyType, 2);
    this.add.text(800, 380, this.enemy.name, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);
  }

  private getEnemyType(enemyName: string): EnemyType {
    switch (enemyName.toLowerCase()) {
      case 'goblin': return EnemyType.GOBLIN;
      case 'orc': return EnemyType.ORC;
      case 'skeleton': return EnemyType.SKELETON;
      case 'troll': return EnemyType.TROLL;
      default: return EnemyType.GOBLIN;
    }
  }

  private createUI() {
    // Player stats
    this.uiElements.playerHealth = this.add.text(50, 450, '', {
      fontSize: '16px',
      color: '#ff6b6b',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.playerAttack = this.add.text(50, 470, '', {
      fontSize: '16px',
      color: '#ffe66d',
      fontFamily: 'Courier New, monospace'
    });

    // Enemy stats
    this.uiElements.enemyHealth = this.add.text(650, 450, '', {
      fontSize: '16px',
      color: '#ff4757',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.enemyAttack = this.add.text(650, 470, '', {
      fontSize: '16px',
      color: '#ffa502',
      fontFamily: 'Courier New, monospace'
    });

    // Combat log
    this.uiElements.combatLog = this.add.text(this.cameras.main.width / 2, 550, '', {
      fontSize: '18px',
      color: '#4ecdc4',
      fontFamily: 'Courier New, monospace',
      align: 'center'
    }).setOrigin(0.5);

    this.updateUI();
  }

  private createActionButtons() {
    const buttonY = 650;
    const spacing = 150;
    const startX = this.cameras.main.width / 2 - spacing;

    // Attack button
    const attackButton = this.add.text(startX, buttonY, 'ATTACK', {
      fontSize: '20px',
      color: '#ffe66d',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#16213e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    attackButton.on('pointerdown', () => this.playerAttack());
    attackButton.on('pointerover', () => attackButton.setStyle({ color: '#ff6b6b' }));
    attackButton.on('pointerout', () => attackButton.setStyle({ color: '#ffe66d' }));

    // Defend button
    const defendButton = this.add.text(startX + spacing, buttonY, 'DEFEND', {
      fontSize: '20px',
      color: '#ffe66d',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#16213e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    defendButton.on('pointerdown', () => this.playerDefend());
    defendButton.on('pointerover', () => defendButton.setStyle({ color: '#4ecdc4' }));
    defendButton.on('pointerout', () => defendButton.setStyle({ color: '#ffe66d' }));

    // Run button
    const runButton = this.add.text(startX + spacing * 2, buttonY, 'RUN', {
      fontSize: '20px',
      color: '#ffe66d',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#16213e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    runButton.on('pointerdown', () => this.playerRun());
    runButton.on('pointerover', () => runButton.setStyle({ color: '#a8a8a8' }));
    runButton.on('pointerout', () => runButton.setStyle({ color: '#ffe66d' }));

    this.actionButtons = [attackButton, defendButton, runButton];
  }

  private playerAttack() {
    if (!this.isPlayerTurn) return;

    const damage = Math.max(1, this.player.attack - this.enemy.defense);
    this.enemy.health -= damage;

    this.showCombatMessage(`You deal ${damage} damage!`);
    this.animateAttack(this.playerSprite, this.enemySprite);

    if (this.enemy.health <= 0) {
      this.enemyDefeated();
    } else {
      this.endPlayerTurn();
    }
  }

  private playerDefend() {
    if (!this.isPlayerTurn) return;

    this.showCombatMessage('You brace for impact!');
    // Defending reduces incoming damage by 50% for this turn
    this.endPlayerTurn();
  }

  private playerRun() {
    if (!this.isPlayerTurn) return;

    const runChance = 0.7; // 70% chance to run
    if (Math.random() < runChance) {
      this.showCombatMessage('You successfully ran away!');
      this.time.delayedCall(1500, () => {
        this.scene.start('GameScene', { gameState: this.gameState });
      });
    } else {
      this.showCombatMessage('You failed to run away!');
      this.endPlayerTurn();
    }
  }

  private endPlayerTurn() {
    this.isPlayerTurn = false;
    this.disableActionButtons();
    
    this.time.delayedCall(1500, () => {
      this.enemyTurn();
    });
  }

  private enemyTurn() {
    const damage = Math.max(1, this.enemy.attack - this.player.defense);
    this.player.health -= damage;

    this.showCombatMessage(`${this.enemy.name} deals ${damage} damage!`);
    this.animateAttack(this.enemySprite, this.playerSprite);

    if (this.player.health <= 0) {
      this.playerDefeated();
    } else {
      this.time.delayedCall(1500, () => {
        this.isPlayerTurn = true;
        this.enableActionButtons();
        this.updateUI();
      });
    }
  }

  private enemyDefeated() {
    this.showCombatMessage(`${this.enemy.name} defeated!`);
    this.player.coins += this.enemy.coins;
    
    this.time.delayedCall(2000, () => {
      this.scene.start('GameScene', { gameState: this.gameState });
    });
  }

  private playerDefeated() {
    this.showCombatMessage('You have been defeated!');
    
    this.time.delayedCall(2000, () => {
      this.scene.start('MenuScene');
    });
  }

  private animateAttack(attacker: Phaser.GameObjects.Image, target: Phaser.GameObjects.Image) {
    // Simple attack animation
    this.tweens.add({
      targets: attacker,
      scaleX: attacker.scaleX * 1.2,
      scaleY: attacker.scaleY * 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    // Target hit animation
    this.tweens.add({
      targets: target,
      tint: 0xff0000,
      duration: 300,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private showCombatMessage(message: string) {
    this.uiElements.combatLog.setText(message);
    this.updateUI();
  }

  private disableActionButtons() {
    this.actionButtons.forEach(button => {
      button.setStyle({ color: '#666666' });
      button.disableInteractive();
    });
  }

  private enableActionButtons() {
    this.actionButtons.forEach(button => {
      button.setStyle({ color: '#ffe66d' });
      button.setInteractive();
    });
  }

  private updateUI() {
    this.uiElements.playerHealth.setText(`HP: ${this.player.health}/${this.player.maxHealth}`);
    this.uiElements.playerAttack.setText(`ATK: ${this.player.attack}`);
    this.uiElements.enemyHealth.setText(`HP: ${this.enemy.health}/${this.enemy.maxHealth}`);
    this.uiElements.enemyAttack.setText(`ATK: ${this.enemy.attack}`);
  }
}