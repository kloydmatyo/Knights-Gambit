import {
  Player,
  Item,
  Weapon,
  Armor,
  Accessory,
  ItemType,
  ItemRarity,
  Equipment,
  Enchantment,
  EnchantmentType,
} from "../types/GameTypes";

export class InventoryManager {
  private readonly INVENTORY_SIZE = 20;

  // Add item to player inventory
  addItem(player: Player, item: Item): boolean {
    // Check if inventory has space
    const totalItems = player.inventory.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems >= this.INVENTORY_SIZE) {
      return false; // Inventory full
    }

    // Check if item already exists (stackable)
    const existingItem = player.inventory.find(invItem => 
      invItem.id === item.id && invItem.type === ItemType.CONSUMABLE
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      player.inventory.push({ ...item });
    }

    return true;
  }

  // Remove item from inventory
  removeItem(player: Player, itemId: string, quantity: number = 1): boolean {
    const itemIndex = player.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = player.inventory[itemIndex];
    if (item.quantity <= quantity) {
      player.inventory.splice(itemIndex, 1);
    } else {
      item.quantity -= quantity;
    }

    return true;
  }

  // Equip item to player
  equipItem(player: Player, item: Item): boolean {
    if (!this.canEquip(player, item)) return false;

    // Unequip current item in slot if exists
    const currentItem = this.getCurrentEquippedItem(player, item.type);
    if (currentItem) {
      this.unequipItem(player, currentItem);
    }

    // Equip new item
    switch (item.type) {
      case ItemType.WEAPON:
        player.equipment.weapon = item as Weapon;
        break;
      case ItemType.ARMOR:
        if (item.name.toLowerCase().includes('helmet')) {
          player.equipment.helmet = item as Armor;
        } else if (item.name.toLowerCase().includes('boots')) {
          player.equipment.boots = item as Armor;
        } else {
          player.equipment.armor = item as Armor;
        }
        break;
      case ItemType.ACCESSORY:
        player.equipment.accessory = item as Accessory;
        break;
    }

    // Apply item stats
    this.applyItemStats(player, item, true);
    
    // Remove from inventory
    this.removeItem(player, item.id, 1);

    return true;
  }

  // Unequip item from player
  unequipItem(player: Player, item: Item): boolean {
    // Add back to inventory
    if (!this.addItem(player, item)) {
      return false; // Inventory full
    }

    // Remove from equipment
    switch (item.type) {
      case ItemType.WEAPON:
        player.equipment.weapon = undefined;
        break;
      case ItemType.ARMOR:
        if (item.name.toLowerCase().includes('helmet')) {
          player.equipment.helmet = undefined;
        } else if (item.name.toLowerCase().includes('boots')) {
          player.equipment.boots = undefined;
        } else {
          player.equipment.armor = undefined;
        }
        break;
      case ItemType.ACCESSORY:
        player.equipment.accessory = undefined;
        break;
    }

    // Remove item stats
    this.applyItemStats(player, item, false);

    return true;
  }

  // Check if player can equip item
  private canEquip(player: Player, item: Item): boolean {
    // Check level requirement
    if (item.level > player.level) return false;

    // Check class restrictions (if any)
    // This could be expanded for class-specific equipment

    return true;
  }

  // Get currently equipped item in slot
  private getCurrentEquippedItem(player: Player, itemType: ItemType): Item | undefined {
    switch (itemType) {
      case ItemType.WEAPON:
        return player.equipment.weapon;
      case ItemType.ARMOR:
        return player.equipment.armor; // Default to chest armor
      case ItemType.ACCESSORY:
        return player.equipment.accessory;
      default:
        return undefined;
    }
  }

  // Apply or remove item stats
  private applyItemStats(player: Player, item: Item, apply: boolean): void {
    const multiplier = apply ? 1 : -1;

    switch (item.type) {
      case ItemType.WEAPON:
        const weapon = item as Weapon;
        player.attack += weapon.attack * multiplier;
        break;
      case ItemType.ARMOR:
        const armor = item as Armor;
        player.defense += armor.defense * multiplier;
        player.maxHealth += armor.healthBonus * multiplier;
        if (apply && armor.healthBonus > 0) {
          player.health = Math.min(player.maxHealth, player.health + armor.healthBonus);
        }
        break;
      case ItemType.ACCESSORY:
        const accessory = item as Accessory;
        this.applyAccessoryEffect(player, accessory, apply);
        break;
    }

    // Apply enchantments
    if ('enchantments' in item && item.enchantments && Array.isArray(item.enchantments)) {
      item.enchantments.forEach((enchantment: Enchantment) => {
        this.applyEnchantment(player, enchantment, apply);
      });
    }
  }

  // Apply accessory effects
  private applyAccessoryEffect(player: Player, accessory: Accessory, apply: boolean): void {
    const multiplier = apply ? 1 : -1;
    const value = accessory.effectValue * multiplier;

    switch (accessory.effect) {
      case 'health_bonus':
        player.maxHealth += value;
        if (apply && value > 0) {
          player.health = Math.min(player.maxHealth, player.health + value);
        }
        break;
      case 'attack_bonus':
        player.attack += value;
        break;
      case 'defense_bonus':
        player.defense += value;
        break;
      case 'mana_bonus':
        if (player.maxMana !== undefined) {
          player.maxMana += value;
          if (apply && value > 0 && player.mana !== undefined) {
            player.mana = Math.min(player.maxMana, player.mana + value);
          }
        }
        break;
    }
  }

  // Apply enchantment effects
  private applyEnchantment(player: Player, enchantment: Enchantment, apply: boolean): void {
    const multiplier = apply ? 1 : -1;
    const value = enchantment.effect.value * multiplier;

    switch (enchantment.effect.type) {
      case EnchantmentType.ATTACK_BONUS:
        player.attack += value;
        break;
      case EnchantmentType.DEFENSE_BONUS:
        player.defense += value;
        break;
      case EnchantmentType.HEALTH_BONUS:
        player.maxHealth += value;
        if (apply && value > 0) {
          player.health = Math.min(player.maxHealth, player.health + value);
        }
        break;
      case EnchantmentType.MANA_BONUS:
        if (player.maxMana !== undefined) {
          player.maxMana += value;
          if (apply && value > 0 && player.mana !== undefined) {
            player.mana = Math.min(player.maxMana, player.mana + value);
          }
        }
        break;
    }
  }

  // Generate random item
  generateRandomItem(floor: number): Item {
    const itemTypes = [ItemType.WEAPON, ItemType.ARMOR, ItemType.ACCESSORY, ItemType.CONSUMABLE];
    const rarities = [ItemRarity.COMMON, ItemRarity.UNCOMMON, ItemRarity.RARE, ItemRarity.EPIC];
    
    // Higher floors have better loot
    const rarityWeights = this.getRarityWeights(floor);
    const selectedRarity = this.weightedRandomSelect(rarities, rarityWeights);
    const selectedType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

    return this.createItem(selectedType, selectedRarity, floor);
  }

  // Get rarity weights based on floor
  private getRarityWeights(floor: number): number[] {
    const baseWeights = [70, 20, 8, 2]; // Common, Uncommon, Rare, Epic
    const floorMultiplier = Math.min(floor / 15, 1); // Max at floor 15
    
    // Shift probability toward higher rarities on higher floors
    return [
      Math.max(10, baseWeights[0] - floorMultiplier * 40), // Common
      baseWeights[1] + floorMultiplier * 15, // Uncommon
      baseWeights[2] + floorMultiplier * 15, // Rare
      baseWeights[3] + floorMultiplier * 10, // Epic
    ];
  }

  // Weighted random selection
  private weightedRandomSelect<T>(items: T[], weights: number[]): T {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }

  // Create specific item
  private createItem(type: ItemType, rarity: ItemRarity, floor: number): Item {
    const baseItem = this.getBaseItem(type, rarity);
    const levelScaling = 1 + (floor - 1) * 0.1;

    switch (type) {
      case ItemType.WEAPON:
        return {
          ...baseItem,
          attack: Math.floor(baseItem.attack * levelScaling),
          durability: baseItem.maxDurability,
          enchantments: this.generateEnchantments(rarity),
        } as Weapon;
      
      case ItemType.ARMOR:
        return {
          ...baseItem,
          defense: Math.floor(baseItem.defense * levelScaling),
          healthBonus: Math.floor(baseItem.healthBonus * levelScaling),
          durability: baseItem.maxDurability,
          enchantments: this.generateEnchantments(rarity),
        } as Armor;
      
      case ItemType.ACCESSORY:
        return {
          ...baseItem,
          effectValue: Math.floor(baseItem.effectValue * levelScaling),
          enchantments: this.generateEnchantments(rarity),
        } as Accessory;
      
      default:
        return baseItem;
    }
  }

  // Get base item template
  private getBaseItem(type: ItemType, rarity: ItemRarity): any {
    const rarityMultiplier = this.getRarityMultiplier(rarity);
    
    switch (type) {
      case ItemType.WEAPON:
        return {
          id: `weapon_${Date.now()}`,
          name: this.getRandomWeaponName(rarity),
          type: ItemType.WEAPON,
          description: "A weapon for combat",
          value: Math.floor(50 * rarityMultiplier),
          quantity: 1,
          rarity,
          level: 1,
          attack: Math.floor(10 * rarityMultiplier),
          critChance: 0.05 * rarityMultiplier,
          maxDurability: Math.floor(100 * rarityMultiplier),
        };
      
      case ItemType.ARMOR:
        return {
          id: `armor_${Date.now()}`,
          name: this.getRandomArmorName(rarity),
          type: ItemType.ARMOR,
          description: "Protective armor",
          value: Math.floor(40 * rarityMultiplier),
          quantity: 1,
          rarity,
          level: 1,
          defense: Math.floor(5 * rarityMultiplier),
          healthBonus: Math.floor(20 * rarityMultiplier),
          maxDurability: Math.floor(80 * rarityMultiplier),
        };
      
      case ItemType.ACCESSORY:
        return {
          id: `accessory_${Date.now()}`,
          name: this.getRandomAccessoryName(rarity),
          type: ItemType.ACCESSORY,
          description: "A magical accessory",
          value: Math.floor(30 * rarityMultiplier),
          quantity: 1,
          rarity,
          level: 1,
          effect: 'attack_bonus',
          effectValue: Math.floor(3 * rarityMultiplier),
        };
      
      default:
        return {
          id: `item_${Date.now()}`,
          name: "Unknown Item",
          type,
          description: "A mysterious item",
          value: 10,
          quantity: 1,
          rarity: ItemRarity.COMMON,
          level: 1,
        };
    }
  }

  // Generate enchantments based on rarity
  private generateEnchantments(rarity: ItemRarity): Enchantment[] {
    const enchantments: Enchantment[] = [];
    const enchantmentCount = this.getEnchantmentCount(rarity);
    
    for (let i = 0; i < enchantmentCount; i++) {
      enchantments.push(this.createRandomEnchantment());
    }
    
    return enchantments;
  }

  private getEnchantmentCount(rarity: ItemRarity): number {
    switch (rarity) {
      case ItemRarity.COMMON: return 0;
      case ItemRarity.UNCOMMON: return Math.random() < 0.3 ? 1 : 0;
      case ItemRarity.RARE: return Math.random() < 0.7 ? 1 : 0;
      case ItemRarity.EPIC: return Math.random() < 0.5 ? 2 : 1;
      case ItemRarity.LEGENDARY: return Math.random() < 0.3 ? 3 : 2;
      default: return 0;
    }
  }

  private createRandomEnchantment(): Enchantment {
    const types = Object.values(EnchantmentType);
    const selectedType = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: `enchant_${Date.now()}_${Math.random()}`,
      name: this.getEnchantmentName(selectedType),
      description: this.getEnchantmentDescription(selectedType),
      effect: {
        type: selectedType,
        value: this.getEnchantmentValue(selectedType),
      },
    };
  }

  private getRarityMultiplier(rarity: ItemRarity): number {
    switch (rarity) {
      case ItemRarity.COMMON: return 1;
      case ItemRarity.UNCOMMON: return 1.3;
      case ItemRarity.RARE: return 1.7;
      case ItemRarity.EPIC: return 2.2;
      case ItemRarity.LEGENDARY: return 3;
      default: return 1;
    }
  }

  private getRandomWeaponName(rarity: ItemRarity): string {
    const prefixes = {
      [ItemRarity.COMMON]: ["Iron", "Steel", "Bronze"],
      [ItemRarity.UNCOMMON]: ["Silver", "Reinforced", "Sharp"],
      [ItemRarity.RARE]: ["Enchanted", "Masterwork", "Blessed"],
      [ItemRarity.EPIC]: ["Legendary", "Ancient", "Mythical"],
      [ItemRarity.LEGENDARY]: ["Divine", "Godslayer", "Eternal"],
    };
    
    const weapons = ["Sword", "Axe", "Mace", "Dagger", "Bow", "Staff"];
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const weapon = weapons[Math.floor(Math.random() * weapons.length)];
    
    return `${prefix} ${weapon}`;
  }

  private getRandomArmorName(rarity: ItemRarity): string {
    const prefixes = {
      [ItemRarity.COMMON]: ["Leather", "Cloth", "Hide"],
      [ItemRarity.UNCOMMON]: ["Studded", "Reinforced", "Thick"],
      [ItemRarity.RARE]: ["Enchanted", "Masterwork", "Blessed"],
      [ItemRarity.EPIC]: ["Legendary", "Ancient", "Mythical"],
      [ItemRarity.LEGENDARY]: ["Divine", "Godforged", "Eternal"],
    };
    
    const armors = ["Armor", "Chestplate", "Helmet", "Boots", "Gauntlets"];
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const armor = armors[Math.floor(Math.random() * armors.length)];
    
    return `${prefix} ${armor}`;
  }

  private getRandomAccessoryName(rarity: ItemRarity): string {
    const prefixes = {
      [ItemRarity.COMMON]: ["Simple", "Plain", "Basic"],
      [ItemRarity.UNCOMMON]: ["Polished", "Fine", "Quality"],
      [ItemRarity.RARE]: ["Enchanted", "Magical", "Blessed"],
      [ItemRarity.EPIC]: ["Legendary", "Ancient", "Mythical"],
      [ItemRarity.LEGENDARY]: ["Divine", "Celestial", "Eternal"],
    };
    
    const accessories = ["Ring", "Amulet", "Pendant", "Bracelet", "Charm"];
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    const accessory = accessories[Math.floor(Math.random() * accessories.length)];
    
    return `${prefix} ${accessory}`;
  }

  private getEnchantmentName(type: EnchantmentType): string {
    switch (type) {
      case EnchantmentType.ATTACK_BONUS: return "Sharpness";
      case EnchantmentType.DEFENSE_BONUS: return "Protection";
      case EnchantmentType.HEALTH_BONUS: return "Vitality";
      case EnchantmentType.MANA_BONUS: return "Wisdom";
      case EnchantmentType.CRIT_CHANCE: return "Precision";
      case EnchantmentType.DAMAGE_REDUCTION: return "Resistance";
      case EnchantmentType.REGENERATION: return "Renewal";
      case EnchantmentType.FIRE_DAMAGE: return "Flame";
      case EnchantmentType.ICE_DAMAGE: return "Frost";
      case EnchantmentType.LIGHTNING_DAMAGE: return "Storm";
      default: return "Unknown";
    }
  }

  private getEnchantmentDescription(type: EnchantmentType): string {
    switch (type) {
      case EnchantmentType.ATTACK_BONUS: return "Increases attack damage";
      case EnchantmentType.DEFENSE_BONUS: return "Increases defense rating";
      case EnchantmentType.HEALTH_BONUS: return "Increases maximum health";
      case EnchantmentType.MANA_BONUS: return "Increases maximum mana";
      case EnchantmentType.CRIT_CHANCE: return "Increases critical hit chance";
      case EnchantmentType.DAMAGE_REDUCTION: return "Reduces incoming damage";
      case EnchantmentType.REGENERATION: return "Slowly regenerates health";
      case EnchantmentType.FIRE_DAMAGE: return "Adds fire damage to attacks";
      case EnchantmentType.ICE_DAMAGE: return "Adds ice damage to attacks";
      case EnchantmentType.LIGHTNING_DAMAGE: return "Adds lightning damage to attacks";
      default: return "Unknown enchantment";
    }
  }

  private getEnchantmentValue(type: EnchantmentType): number {
    switch (type) {
      case EnchantmentType.ATTACK_BONUS: return Math.floor(Math.random() * 5) + 2;
      case EnchantmentType.DEFENSE_BONUS: return Math.floor(Math.random() * 3) + 1;
      case EnchantmentType.HEALTH_BONUS: return Math.floor(Math.random() * 20) + 10;
      case EnchantmentType.MANA_BONUS: return Math.floor(Math.random() * 15) + 5;
      case EnchantmentType.CRIT_CHANCE: return (Math.random() * 0.1) + 0.05;
      case EnchantmentType.DAMAGE_REDUCTION: return (Math.random() * 0.15) + 0.05;
      case EnchantmentType.REGENERATION: return Math.floor(Math.random() * 3) + 1;
      case EnchantmentType.FIRE_DAMAGE: return Math.floor(Math.random() * 8) + 3;
      case EnchantmentType.ICE_DAMAGE: return Math.floor(Math.random() * 6) + 2;
      case EnchantmentType.LIGHTNING_DAMAGE: return Math.floor(Math.random() * 10) + 4;
      default: return 1;
    }
  }
}