import * as Phaser from 'phaser';
import { Player, Enemy, GameState, StatusEffectType } from '../types/GameTypes';
import { SpriteManager, CharacterType, EnemyType } from '../managers/SpriteManager';
import { SkillManager } from '../managers/SkillManager';
import { GameManager } from '../managers/GameManager';

export class CombatScene extends Phaser.Scene {
  private player!: Player;
  private enemy!: Enemy;
  private gameState!: GameState;
  private spriteManager!: SpriteManager;
  private skillManager!: SkillManager;
  private gameManager!: GameManager;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private uiElements: { [key: string]: Phaser.GameObjects.Text } = {};
  private actionButtons: Phaser.GameObjects.Text[] = [];
  private skillButtons: Phaser.GameObjects.Text[] = [];
  private isPlayerTurn = true;
  private isDefending = false;
  private combatMessages: string[] = [];
  private skillTooltip: Phaser.GameObjects.Text | null = null;

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
    this.skillManager = new SkillManager();
    this.gameManager = new GameManager();
    
    // Background
    this.add.rectangle(this.cameras.main.width / 2, this.cameras.main.height / 2, 
      this.cameras.main.width, this.cameras.main.height, 0x0f0f23);

    // Title
    this.add.text(this.cameras.main.width / 2, 50, '⚔️ COMBAT ⚔️', {
      fontSize: '32px',
      color: '#ff6b6b',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    this.createCombatants();
    this.createUI();
    this.createActionButtons();
    this.createSkillButtons();
    
    // Apply passive skills at combat start
    this.applyPassiveSkills();
  }

  private createCombatants() {
    // Player sprite (left side) - use correct class sprite
    const className = this.player.class?.name || "knight";
    try {
      switch (className) {
        case "knight":
          this.playerSprite = this.spriteManager.createKnight(300, 350, 3);
          break;
        case "archer":
          this.playerSprite = this.spriteManager.createArcher(300, 350, 3);
          break;
        case "mage":
          this.playerSprite = this.spriteManager.createMage(300, 350, 3);
          break;
        case "barbarian":
          this.playerSprite = this.spriteManager.createBarbarian(300, 350, 3);
          break;
        case "assassin":
          this.playerSprite = this.spriteManager.createAssassin(300, 350, 3);
          break;
        case "cleric":
          this.playerSprite = this.spriteManager.createCleric(300, 350, 3);
          break;
        default:
          this.playerSprite = this.spriteManager.createKnight(300, 350, 3);
      }
    } catch (error) {
      this.playerSprite = this.spriteManager.createKnight(300, 350, 3);
    }

    this.add.text(300, 450, this.player.name || 'Player', {
      fontSize: '18px',
      color: '#4ecdc4',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    // Enemy sprite (right side)
    const enemyType = this.getEnemyType(this.enemy.name);
    this.enemySprite = this.spriteManager.createEnemy(1000, 350, enemyType, 3);
    this.add.text(1000, 450, this.enemy.name, {
      fontSize: '18px',
      color: '#e74c3c',
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
    // Player stats (left side)
    this.uiElements.playerHealth = this.add.text(50, 500, '', {
      fontSize: '16px',
      color: '#ff6b6b',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.playerAttack = this.add.text(50, 520, '', {
      fontSize: '16px',
      color: '#ffe66d',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.playerDefense = this.add.text(50, 540, '', {
      fontSize: '16px',
      color: '#4ecdc4',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.playerMana = this.add.text(50, 560, '', {
      fontSize: '16px',
      color: '#3498db',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.playerStatus = this.add.text(50, 580, '', {
      fontSize: '14px',
      color: '#9b59b6',
      fontFamily: 'Courier New, monospace'
    });

    // Enemy stats (right side)
    this.uiElements.enemyHealth = this.add.text(1150, 500, '', {
      fontSize: '16px',
      color: '#ff4757',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.enemyAttack = this.add.text(1150, 520, '', {
      fontSize: '16px',
      color: '#ffa502',
      fontFamily: 'Courier New, monospace'
    });

    this.uiElements.enemyDefense = this.add.text(1150, 540, '', {
      fontSize: '16px',
      color: '#ffa502',
      fontFamily: 'Courier New, monospace'
    });

    // Combat log (center, multiple lines)
    this.uiElements.combatLog = this.add.text(this.cameras.main.width / 2, 150, '', {
      fontSize: '16px',
      color: '#4ecdc4',
      fontFamily: 'Courier New, monospace',
      align: 'center',
      wordWrap: { width: 800 }
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

  private createSkillButtons() {
    const playerSkills = this.player.skills.filter(ps => ps.unlocked);
    const skillStartY = 700;
    const skillSpacing = 120;
    
    // Skills title
    this.add.text(this.cameras.main.width / 2, skillStartY - 30, '⚡ SKILLS', {
      fontSize: '18px',
      color: '#f39c12',
      fontFamily: 'Courier New, monospace'
    }).setOrigin(0.5);

    playerSkills.forEach((playerSkill, index) => {
      const skill = this.skillManager.getSkill(playerSkill.skillId);
      if (!skill || skill.type !== 'active') return; // Only show active skills

      const skillX = this.cameras.main.width / 2 - (skillSpacing * (playerSkills.length - 1)) / 2 + index * skillSpacing;
      const canUse = this.skillManager.canUseSkill(this.player, skill.id);
      const cooldown = this.player.skillCooldowns[skill.id] || 0;
      
      let buttonText = skill.name;
      if (cooldown > 0) {
        buttonText += ` (${cooldown})`;
      }
      
      const skillButton = this.add.text(skillX, skillStartY, buttonText, {
        fontSize: '14px',
        color: canUse ? '#f39c12' : '#666666',
        fontFamily: 'Courier New, monospace',
        backgroundColor: '#16213e',
        padding: { x: 10, y: 5 },
      }).setOrigin(0.5);

      if (canUse) {
        skillButton.setInteractive();
        skillButton.on('pointerdown', () => this.useSkill(skill.id));
        skillButton.on('pointerover', () => {
          skillButton.setStyle({ color: '#ff6b6b' });
          this.showSkillTooltip(skill, skillX, skillStartY - 40);
        });
        skillButton.on('pointerout', () => {
          skillButton.setStyle({ color: '#f39c12' });
          this.hideSkillTooltip();
        });
      }

      this.skillButtons.push(skillButton);
    });
  }

  private playerAttack() {
    if (!this.isPlayerTurn) return;

    let damage = Math.max(1, this.player.attack - this.enemy.defense);
    let isCritical = false;
    
    // Apply passive skill effects
    this.player.skills.forEach(playerSkill => {
      const skill = this.skillManager.getSkill(playerSkill.skillId);
      if (skill && skill.type === 'passive') {
        switch (skill.id) {
          case 'hunters_mark':
            // +100% crit chance vs enemies below 50% HP
            if (this.enemy.health < this.enemy.maxHealth * 0.5) {
              isCritical = true;
              damage *= 2;
              this.addCombatMessage("Hunter's Mark triggered! Critical hit!");
            }
            break;
          case 'poison_mastery':
            // 35% chance to poison
            if (Math.random() < 0.35) {
              this.addStatusEffect(this.enemy, {
                type: StatusEffectType.POISON,
                duration: 3,
                damage: 12,
                description: 'Poisoned by assassin'
              });
              this.addCombatMessage("Enemy poisoned!");
            }
            // +25% damage vs poisoned enemies
            if (this.enemy.statusEffects?.some((e: any) => e.type === StatusEffectType.POISON)) {
              damage = Math.floor(damage * 1.25);
              this.addCombatMessage("Bonus damage vs poisoned enemy!");
            }
            break;
        }
      }
    });

    this.enemy.health = Math.max(0, this.enemy.health - damage);

    this.addCombatMessage(`${this.player.name} deals ${damage} damage!${isCritical ? ' CRITICAL!' : ''}`);
    this.animateAttack(this.playerSprite, this.enemySprite);

    this.checkCombatEnd() || this.endPlayerTurn();
  }

  private playerDefend() {
    if (!this.isPlayerTurn) return;

    this.isDefending = true;
    this.addCombatMessage(`${this.player.name} braces for impact!`);
    this.endPlayerTurn();
  }

  private playerRun() {
    if (!this.isPlayerTurn) return;

    const runChance = 0.7; // 70% chance to run
    if (Math.random() < runChance) {
      this.addCombatMessage(`${this.player.name} successfully ran away!`);
      this.time.delayedCall(1500, () => {
        this.scene.start('GameScene', { gameState: this.gameState });
      });
    } else {
      this.addCombatMessage(`${this.player.name} failed to run away!`);
      this.endPlayerTurn();
    }
  }

  private endPlayerTurn() {
    this.isPlayerTurn = false;
    this.disableActionButtons();
    
    // Apply end-of-turn effects
    this.applyStatusEffects(this.player);
    this.skillManager.updateCooldowns(this.player);
    
    this.time.delayedCall(1500, () => {
      this.enemyTurn();
    });
  }

  private enemyTurn() {
    let damage = Math.max(1, this.enemy.attack - this.player.defense);
    let blocked = false;
    
    // Apply defensive effects
    if (this.isDefending) {
      damage = Math.floor(damage * 0.5);
      this.isDefending = false;
      this.addCombatMessage("Damage reduced by defending!");
    }
    
    // Check for passive defensive skills
    this.player.skills.forEach(playerSkill => {
      const skill = this.skillManager.getSkill(playerSkill.skillId);
      if (skill && skill.type === 'passive') {
        switch (skill.id) {
          case 'mana_shield':
            // Damage absorbed by mana at 2:1 ratio
            if (this.player.mana && this.player.mana > 0) {
              const manaNeeded = damage * 2;
              if (this.player.mana >= manaNeeded) {
                this.player.mana -= manaNeeded;
                damage = 0;
                this.addCombatMessage("Mana Shield absorbed all damage!");
              } else {
                const absorbedDamage = Math.floor(this.player.mana / 2);
                damage -= absorbedDamage;
                this.player.mana = 0;
                this.addCombatMessage(`Mana Shield absorbed ${absorbedDamage} damage!`);
              }
            }
            break;
          case 'shadow_step':
            // Check if shadow step is active
            if (this.player.statusEffects?.some(e => e.type === StatusEffectType.SHADOW_STEP)) {
              damage = 0;
              blocked = true;
              this.addCombatMessage("Attack missed - player in shadows!");
            }
            break;
        }
      }
    });

    if (!blocked && damage > 0) {
      this.player.health = Math.max(0, this.player.health - damage);
      this.addCombatMessage(`${this.enemy.name} deals ${damage} damage!`);
    }

    this.animateAttack(this.enemySprite, this.playerSprite);

    // Apply enemy status effects
    this.applyStatusEffects(this.enemy);

    if (this.checkCombatEnd()) return;

    this.time.delayedCall(1500, () => {
      this.isPlayerTurn = true;
      this.enableActionButtons();
      this.updateSkillButtons();
      this.updateUI();
    });
  }

  private applyStatusEffects(target: Player | Enemy) {
    if (!target.statusEffects) return;

    target.statusEffects.forEach((effect: any) => {
      switch (effect.type) {
        case StatusEffectType.POISON:
          if (effect.damage) {
            target.health = Math.max(0, target.health - effect.damage);
            this.addCombatMessage(`${target.name || 'Enemy'} takes ${effect.damage} poison damage!`);
          }
          break;
        case StatusEffectType.REGENERATION:
          if (effect.damage && target.health < target.maxHealth) {
            const healed = Math.min(effect.damage, target.maxHealth - target.health);
            target.health += healed;
            this.addCombatMessage(`${target.name || 'Enemy'} regenerates ${healed} HP!`);
          }
          break;
        case StatusEffectType.BURN:
          if (effect.damage) {
            target.health = Math.max(0, target.health - effect.damage);
            this.addCombatMessage(`${target.name || 'Enemy'} takes ${effect.damage} burn damage!`);
          }
          break;
      }

      // Reduce duration
      if (effect.duration > 0) {
        effect.duration--;
      }
    });

    // Remove expired effects
    target.statusEffects = target.statusEffects.filter((effect: any) => 
      effect.duration === -1 || effect.duration > 0
    );
  }

  private enemyDefeated() {
    this.addCombatMessage(`${this.enemy.name} defeated!`);
    this.player.coins += this.enemy.coins;
    
    // Apply bloodthirst passive skill
    this.player.skills.forEach(playerSkill => {
      const skill = this.skillManager.getSkill(playerSkill.skillId);
      if (skill && skill.id === 'bloodthirst') {
        const healAmount = Math.floor(this.player.maxHealth * 0.25);
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
        this.player.attack += 5; // Stacking attack bonus
        this.addCombatMessage(`Bloodthirst: Healed ${healAmount} HP, +5 ATK!`);
      }
    });
    
    this.time.delayedCall(3000, () => {
      this.scene.start('GameScene', { gameState: this.gameState });
    });
  }

  private playerDefeated() {
    this.addCombatMessage(`${this.player.name} has been defeated!`);
    
    this.time.delayedCall(3000, () => {
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
    this.addCombatMessage(message);
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

  private showSkillTooltip(skill: any, x: number, y: number) {
    this.skillTooltip = this.add.text(x, y, skill.description, {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
      wordWrap: { width: 200 },
    }).setOrigin(0.5);
  }

  private hideSkillTooltip() {
    if (this.skillTooltip) {
      this.skillTooltip.destroy();
      this.skillTooltip = null;
    }
  }

  private useSkill(skillId: string) {
    if (!this.isPlayerTurn) return;

    const result = this.skillManager.useSkill(this.player, skillId, this.enemy);
    
    if (result.success) {
      this.addCombatMessage(`${this.player.name} used ${this.skillManager.getSkill(skillId)?.name}!`);
      
      if (result.effects) {
        result.effects.forEach(effect => {
          this.addCombatMessage(`${effect.target}: ${effect.type} ${effect.value}`);
        });
      }
      
      this.updateSkillButtons();
      this.checkCombatEnd();
      
      if (this.enemy.health > 0) {
        this.endPlayerTurn();
      }
    } else {
      this.addCombatMessage("Cannot use skill!");
    }
  }

  private applyPassiveSkills() {
    // Apply passive skill effects at combat start and during combat
    this.player.skills.forEach(playerSkill => {
      const skill = this.skillManager.getSkill(playerSkill.skillId);
      if (skill && skill.type === 'passive') {
        this.applyPassiveSkillEffect(skill);
      }
    });
  }

  private applyPassiveSkillEffect(skill: any) {
    switch (skill.id) {
      case 'guardians_resolve':
        // +3 Defense per defeated ally (simplified for single combat)
        break;
      case 'hunters_mark':
        // Applied during attack calculation
        break;
      case 'mana_shield':
        // Applied during damage calculation
        break;
      case 'bloodthirst':
        // Applied when enemy is defeated
        break;
      case 'poison_mastery':
        // Applied during attack
        break;
      case 'blessed_aura':
        // Continuous regeneration effect
        this.addStatusEffect(this.player, {
          type: StatusEffectType.REGENERATION,
          duration: -1,
          damage: 5,
          description: 'Blessed Aura - Regenerates 5 HP per turn'
        });
        break;
    }
  }

  private addStatusEffect(target: Player | Enemy, effect: any) {
    if ('statusEffects' in target) {
      target.statusEffects = target.statusEffects || [];
      target.statusEffects.push(effect);
    }
  }

  private updateSkillButtons() {
    // Destroy existing skill buttons
    this.skillButtons.forEach(button => button.destroy());
    this.skillButtons = [];
    
    // Recreate skill buttons with updated cooldowns
    this.createSkillButtons();
  }

  private addCombatMessage(message: string) {
    this.combatMessages.push(message);
    if (this.combatMessages.length > 4) {
      this.combatMessages.shift(); // Keep only last 4 messages
    }
    this.uiElements.combatLog.setText(this.combatMessages.join('\n'));
  }

  private checkCombatEnd() {
    if (this.enemy.health <= 0) {
      this.enemyDefeated();
      return true;
    }
    if (this.player.health <= 0) {
      this.playerDefeated();
      return true;
    }
    return false;
  }

  private updateUI() {
    this.uiElements.playerHealth.setText(`HP: ${this.player.health}/${this.player.maxHealth}`);
    this.uiElements.playerAttack.setText(`ATK: ${this.player.attack}`);
    this.uiElements.playerDefense.setText(`DEF: ${this.player.defense}`);
    
    // Show mana for mage
    if (this.player.mana !== undefined && this.player.maxMana !== undefined) {
      this.uiElements.playerMana.setText(`MP: ${this.player.mana}/${this.player.maxMana}`);
    } else {
      this.uiElements.playerMana.setText('');
    }
    
    // Show status effects
    const statusTexts = (this.player.statusEffects || []).map(effect => {
      let statusText = '';
      switch (effect.type) {
        case StatusEffectType.POISON:
          statusText = '☠️ POISONED';
          break;
        case StatusEffectType.REGENERATION:
          statusText = '💚 HEALING';
          break;
        case StatusEffectType.BLESSING:
          statusText = '✨ BLESSED';
          break;
        case StatusEffectType.BERSERKER_RAGE:
          statusText = '⚡ RAGE';
          break;
        case StatusEffectType.SHADOW_STEP:
          statusText = '👤 SHADOW';
          break;
        case StatusEffectType.SHIELD_WALL:
          statusText = '🛡️ SHIELD';
          break;
        default:
          statusText = effect.type.toUpperCase();
      }
      
      if (effect.duration > 0) {
        statusText += ` (${effect.duration})`;
      }
      
      return statusText;
    });
    
    this.uiElements.playerStatus.setText(statusTexts.join(' | '));
    
    this.uiElements.enemyHealth.setText(`HP: ${this.enemy.health}/${this.enemy.maxHealth}`);
    this.uiElements.enemyAttack.setText(`ATK: ${this.enemy.attack}`);
    this.uiElements.enemyDefense.setText(`DEF: ${this.enemy.defense}`);
  }
}