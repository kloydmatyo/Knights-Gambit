import {
  Player,
  Skill,
  SkillType,
  SkillEffectType,
  SkillTarget,
  CharacterClassName,
  StatusEffect,
  StatusEffectType,
  Enemy,
} from "../types/GameTypes";

export class SkillManager {
  private skills: Map<string, Skill> = new Map();

  constructor() {
    this.initializeSkills();
  }

  private initializeSkills() {
    // Knight Skills
    this.addSkill({
      id: "shield_wall",
      name: "Shield Wall",
      type: SkillType.ACTIVE,
      description: "Blocks next 3 attacks and reflects 50% damage back to attackers",
      effect: {
        type: SkillEffectType.SHIELD,
        value: 3,
        duration: 3,
        target: SkillTarget.SELF,
      },
      cooldown: 5,
      className: CharacterClassName.KNIGHT,
    });

    this.addSkill({
      id: "guardians_resolve",
      name: "Guardian's Resolve",
      type: SkillType.PASSIVE,
      description: "Gains +3 Defense per defeated ally",
      effect: {
        type: SkillEffectType.BUFF,
        value: 3,
        target: SkillTarget.SELF,
        conditions: [{ type: "ally_defeated" as any, value: 1 }],
      },
      cooldown: 0,
      className: CharacterClassName.KNIGHT,
    });

    this.addSkill({
      id: "righteous_strike",
      name: "Righteous Strike",
      type: SkillType.ACTIVE,
      description: "200% weapon damage with 30% stun chance, +50% vs evil",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 2.0,
        target: SkillTarget.ENEMY,
        additionalEffects: [
          {
            type: SkillEffectType.DEBUFF,
            value: 0.3,
            duration: 1,
            target: SkillTarget.ENEMY,
          },
        ],
      },
      cooldown: 4,
      className: CharacterClassName.KNIGHT,
    });

    // Archer Skills
    this.addSkill({
      id: "piercing_shot",
      name: "Piercing Shot",
      type: SkillType.ACTIVE,
      description: "Arrow pierces through 3 enemies, ignoring armor",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 1.0,
        target: SkillTarget.ALL_ENEMIES,
      },
      cooldown: 3,
      className: CharacterClassName.ARCHER,
    });

    this.addSkill({
      id: "hunters_mark",
      name: "Hunter's Mark",
      type: SkillType.PASSIVE,
      description: "+100% crit chance vs enemies below 50% HP",
      effect: {
        type: SkillEffectType.BUFF,
        value: 1.0,
        target: SkillTarget.SELF,
        conditions: [{ type: "health_below" as any, value: 0.5 }],
      },
      cooldown: 0,
      className: CharacterClassName.ARCHER,
    });

    this.addSkill({
      id: "explosive_arrow",
      name: "Explosive Arrow",
      type: SkillType.ACTIVE,
      description: "150% damage to target, 75% to adjacent, applies burn",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 1.5,
        target: SkillTarget.ENEMY,
        additionalEffects: [
          {
            type: SkillEffectType.DEBUFF,
            value: 10,
            duration: 3,
            target: SkillTarget.ALL_ENEMIES,
          },
        ],
      },
      cooldown: 5,
      className: CharacterClassName.ARCHER,
    });

    // Mage Skills
    this.addSkill({
      id: "arcane_missiles",
      name: "Arcane Missiles",
      type: SkillType.ACTIVE,
      description: "5 auto-targeting missiles with escalating damage",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 0.4,
        target: SkillTarget.ALL_ENEMIES,
      },
      cooldown: 4,
      manaCost: 30,
      className: CharacterClassName.MAGE,
    });

    this.addSkill({
      id: "mana_shield",
      name: "Mana Shield",
      type: SkillType.PASSIVE,
      description: "Damage absorbed by mana at 2:1 ratio",
      effect: {
        type: SkillEffectType.SHIELD,
        value: 0.5,
        target: SkillTarget.SELF,
      },
      cooldown: 0,
      className: CharacterClassName.MAGE,
    });

    this.addSkill({
      id: "elemental_mastery",
      name: "Elemental Mastery",
      type: SkillType.ACTIVE,
      description: "Cycles Fire/Ice/Lightning with unique effects",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 1.5,
        target: SkillTarget.ENEMY,
      },
      cooldown: 3,
      manaCost: 25,
      className: CharacterClassName.MAGE,
    });

    // Barbarian Skills
    this.addSkill({
      id: "berserker_rage",
      name: "Berserker Rage",
      type: SkillType.ACTIVE,
      description: "+100% damage, +50% resistance, extra attack for 4 turns",
      effect: {
        type: SkillEffectType.BUFF,
        value: 2.0,
        duration: 4,
        target: SkillTarget.SELF,
      },
      cooldown: 6,
      className: CharacterClassName.BARBARIAN,
    });

    this.addSkill({
      id: "bloodthirst",
      name: "Bloodthirst",
      type: SkillType.PASSIVE,
      description: "Heal 25% HP on kill, +5 ATK per kill (stacks)",
      effect: {
        type: SkillEffectType.HEAL,
        value: 0.25,
        target: SkillTarget.SELF,
      },
      cooldown: 0,
      className: CharacterClassName.BARBARIAN,
    });

    this.addSkill({
      id: "earthquake_slam",
      name: "Earthquake Slam",
      type: SkillType.ACTIVE,
      description: "150% damage to all enemies, 40% knockdown chance",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 1.5,
        target: SkillTarget.ALL_ENEMIES,
        additionalEffects: [
          {
            type: SkillEffectType.DEBUFF,
            value: 0.4,
            duration: 1,
            target: SkillTarget.ALL_ENEMIES,
          },
        ],
      },
      cooldown: 5,
      className: CharacterClassName.BARBARIAN,
    });

    // Assassin Skills
    this.addSkill({
      id: "shadow_step",
      name: "Shadow Step",
      type: SkillType.ACTIVE,
      description: "Become untargetable, next attack deals 300% critical damage",
      effect: {
        type: SkillEffectType.BUFF,
        value: 3.0,
        duration: 1,
        target: SkillTarget.SELF,
      },
      cooldown: 4,
      className: CharacterClassName.ASSASSIN,
    });

    this.addSkill({
      id: "poison_mastery",
      name: "Poison Mastery",
      type: SkillType.PASSIVE,
      description: "35% poison chance, +25% damage vs poisoned enemies",
      effect: {
        type: SkillEffectType.BUFF,
        value: 0.35,
        target: SkillTarget.SELF,
      },
      cooldown: 0,
      className: CharacterClassName.ASSASSIN,
    });

    this.addSkill({
      id: "thousand_cuts",
      name: "Thousand Cuts",
      type: SkillType.ACTIVE,
      description: "5 escalating attacks, final crit if all connect",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 0.6,
        target: SkillTarget.ENEMY,
      },
      cooldown: 6,
      className: CharacterClassName.ASSASSIN,
    });

    // Cleric Skills
    this.addSkill({
      id: "divine_healing",
      name: "Divine Healing",
      type: SkillType.ACTIVE,
      description: "Heal based on missing HP, removes all debuffs",
      effect: {
        type: SkillEffectType.HEAL,
        value: 0.4,
        target: SkillTarget.SELF,
      },
      cooldown: 3,
      className: CharacterClassName.CLERIC,
    });

    this.addSkill({
      id: "blessed_aura",
      name: "Blessed Aura",
      type: SkillType.PASSIVE,
      description: "Party-wide regen and defense, doubles when critical",
      effect: {
        type: SkillEffectType.BUFF,
        value: 5,
        target: SkillTarget.ALL_ALLIES,
      },
      cooldown: 0,
      className: CharacterClassName.CLERIC,
    });

    this.addSkill({
      id: "wrath_of_heaven",
      name: "Wrath of Heaven",
      type: SkillType.ACTIVE,
      description: "AoE holy damage that heals allies",
      effect: {
        type: SkillEffectType.DAMAGE,
        value: 1.2,
        target: SkillTarget.ALL_ENEMIES,
        additionalEffects: [
          {
            type: SkillEffectType.HEAL,
            value: 0.3,
            target: SkillTarget.ALL_ALLIES,
          },
        ],
      },
      cooldown: 5,
      className: CharacterClassName.CLERIC,
    });
  }

  private addSkill(skill: Skill) {
    this.skills.set(skill.id, skill);
  }

  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  getClassSkills(className: CharacterClassName): Skill[] {
    return Array.from(this.skills.values()).filter(
      (skill) => skill.className === className
    );
  }

  canUseSkill(player: Player, skillId: string): boolean {
    const skill = this.getSkill(skillId);
    if (!skill) return false;

    // Check if skill is on cooldown
    const cooldown = player.skillCooldowns[skillId] || 0;
    if (cooldown > 0) return false;

    // Check mana cost for mages
    if (skill.manaCost && player.mana !== undefined) {
      if (player.mana < skill.manaCost) return false;
    }

    // Check if skill is unlocked
    const playerSkill = player.skills.find((ps) => ps.skillId === skillId);
    if (!playerSkill || !playerSkill.unlocked) return false;

    return true;
  }

  useSkill(player: Player, skillId: string, target?: Enemy): SkillResult {
    const skill = this.getSkill(skillId);
    if (!skill || !this.canUseSkill(player, skillId)) {
      return { success: false, message: "Cannot use skill" };
    }

    // Apply mana cost
    if (skill.manaCost && player.mana !== undefined) {
      player.mana -= skill.manaCost;
    }

    // Set cooldown
    player.skillCooldowns[skillId] = skill.cooldown;

    // Apply skill effects
    const result = this.applySkillEffect(player, skill, target);

    return {
      success: true,
      message: `Used ${skill.name}!`,
      effects: result,
    };
  }

  private applySkillEffect(
    player: Player,
    skill: Skill,
    target?: Enemy
  ): SkillEffectResult[] {
    const results: SkillEffectResult[] = [];

    switch (skill.effect.type) {
      case SkillEffectType.DAMAGE:
        if (target) {
          const damage = Math.floor(player.attack * skill.effect.value);
          target.health = Math.max(0, target.health - damage);
          results.push({
            type: "damage",
            value: damage,
            target: target.name,
          });
        }
        break;

      case SkillEffectType.HEAL:
        const healAmount = Math.floor(player.maxHealth * skill.effect.value);
        player.health = Math.min(player.maxHealth, player.health + healAmount);
        results.push({
          type: "heal",
          value: healAmount,
          target: player.name,
        });
        break;

      case SkillEffectType.BUFF:
        this.applyStatusEffect(player, skill);
        results.push({
          type: "buff",
          value: skill.effect.value,
          target: player.name,
        });
        break;

      case SkillEffectType.SHIELD:
        this.applyShieldEffect(player, skill);
        results.push({
          type: "shield",
          value: skill.effect.value,
          target: player.name,
        });
        break;
    }

    // Apply additional effects
    if (skill.effect.additionalEffects) {
      skill.effect.additionalEffects.forEach((additionalEffect) => {
        // Recursively apply additional effects
        const additionalSkill: Skill = {
          ...skill,
          effect: additionalEffect,
        };
        const additionalResults = this.applySkillEffect(
          player,
          additionalSkill,
          target
        );
        results.push(...additionalResults);
      });
    }

    return results;
  }

  private applyStatusEffect(player: Player, skill: Skill) {
    let statusType: StatusEffectType;

    switch (skill.id) {
      case "berserker_rage":
        statusType = StatusEffectType.BERSERKER_RAGE;
        break;
      case "shadow_step":
        statusType = StatusEffectType.SHADOW_STEP;
        break;
      case "shield_wall":
        statusType = StatusEffectType.SHIELD_WALL;
        break;
      case "mana_shield":
        statusType = StatusEffectType.MANA_SHIELD;
        break;
      case "blessed_aura":
        statusType = StatusEffectType.BLESSED_AURA;
        break;
      case "hunters_mark":
        statusType = StatusEffectType.HUNTERS_MARK;
        break;
      case "bloodthirst":
        statusType = StatusEffectType.BLOODTHIRST;
        break;
      default:
        statusType = StatusEffectType.STRENGTH_BOOST;
    }

    const statusEffect: StatusEffect = {
      type: statusType,
      duration: skill.effect.duration || -1,
      description: skill.description,
      applied: false,
    };

    // Remove existing effect of same type
    player.statusEffects = player.statusEffects.filter(
      (effect) => effect.type !== statusType
    );

    // Add new effect
    player.statusEffects.push(statusEffect);
  }

  private applyShieldEffect(player: Player, skill: Skill) {
    // Shield effects are handled as status effects
    this.applyStatusEffect(player, skill);
  }

  updateCooldowns(player: Player) {
    Object.keys(player.skillCooldowns).forEach((skillId) => {
      if (player.skillCooldowns[skillId] > 0) {
        player.skillCooldowns[skillId]--;
      }
    });
  }

  initializePlayerSkills(player: Player) {
    const classSkills = this.getClassSkills(player.class.name as CharacterClassName);
    
    player.skills = classSkills.map((skill) => ({
      skillId: skill.id,
      level: 1,
      unlocked: true, // All skills unlocked for now
    }));

    player.skillCooldowns = {};
    classSkills.forEach((skill) => {
      player.skillCooldowns[skill.id] = 0;
    });

    // Initialize mana for mage
    if (player.class.name === CharacterClassName.MAGE) {
      player.mana = player.class.baseMana || 100;
      player.maxMana = player.class.baseMana || 100;
    }
  }
}

export interface SkillResult {
  success: boolean;
  message: string;
  effects?: SkillEffectResult[];
}

export interface SkillEffectResult {
  type: string;
  value: number;
  target: string;
}