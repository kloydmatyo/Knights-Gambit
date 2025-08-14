# 🎨 Knight's Gambit - Complete Sprite Collection

## ✅ All Sprites Created!

### 🏰 Character Classes (6 total):

1. **🛡️ Knight** - `assets/knight.svg` ✅
2. **🏹 Archer** - `assets/archer.svg` ✅
3. **🔮 Mage** - `assets/mage.svg` ✅
4. **⚔️ Barbarian** - `assets/barbarian.svg` ✅
5. **🗡️ Assassin** - `assets/assassin.svg` ✅
6. **✨ Cleric** - `assets/cleric.svg` ✅

### 🐉 Enemy Types (4 total):

1. **🟢 Goblin** - `assets/goblin.svg` ✅
2. **🟤 Orc** - `assets/orc.svg` ✅
3. **💀 Skeleton** - `assets/skeleton.svg` ✅
4. **🟫 Troll** - `assets/troll.svg` ✅

## 📁 Complete File Structure:

### Spritesheets:

- **`assets/characters.svg`** - All 6 characters (192×32)
- **`assets/enemies.svg`** - All 4 enemies (128×32)

### Individual Character Files:

- `assets/knight.svg` (32×32)
- `assets/archer.svg` (32×32)
- `assets/mage.svg` (32×32)
- `assets/barbarian.svg` (32×32)
- `assets/assassin.svg` (32×32)
- `assets/cleric.svg` (32×32)

### Individual Enemy Files:

- `assets/goblin.svg` (32×32)
- `assets/orc.svg` (32×32)
- `assets/skeleton.svg` (32×32)
- `assets/troll.svg` (32×32)

### Preview Pages:

- **`assets/character-preview.html`** - View all characters
- **`assets/enemy-preview.html`** - View all enemies

### Integration:

- **`src/managers/SpriteManager.ts`** - Phaser integration helper

## 🎯 Enemy Designs & Stats:

### 🟢 Goblin (Weakest)

- **Appearance**: Small, green skin, large ears, red eyes
- **Weapon**: Dagger
- **Stats**: HP: 30, ATK: 8, DEF: 2, Coins: 15
- **Colors**: Green (#228B22), Red eyes (#FF0000)

### 🟤 Orc (Medium-Low)

- **Appearance**: Large, green-gray skin, white tusks
- **Weapon**: War axe
- **Stats**: HP: 50, ATK: 12, DEF: 4, Coins: 25
- **Colors**: Gray-green (#8FBC8F), White tusks (#FFFFFF)

### 💀 Skeleton (Medium-High)

- **Appearance**: Bone white, hollow eye sockets, ribcage
- **Weapon**: Spear
- **Stats**: HP: 40, ATK: 10, DEF: 3, Coins: 20
- **Colors**: Bone white (#F5F5DC), Black sockets (#000000)

### 🟫 Troll (Strongest)

- **Appearance**: Massive, moss-covered, orange eyes
- **Weapon**: Large club
- **Stats**: HP: 80, ATK: 15, DEF: 6, Coins: 40
- **Colors**: Dark green (#556B2F), Orange eyes (#FF4500)

## 🎮 Phaser Integration Examples:

### Loading All Sprites:

```typescript
import {
  SpriteManager,
  CharacterType,
  EnemyType,
} from "./managers/SpriteManager";

// In preload()
const spriteManager = new SpriteManager(this);
spriteManager.preloadAll(); // Loads both characters and enemies

// Or load separately
spriteManager.preloadCharacters();
spriteManager.preloadEnemies();
```

### Creating Sprites:

```typescript
// Characters
const knight = spriteManager.createKnight(x, y, 4);
const archer = spriteManager.createArcher(x, y, 4);

// Enemies
const goblin = spriteManager.createGoblin(x, y, 4);
const troll = spriteManager.createTroll(x, y, 4);

// Generic creation
const mage = spriteManager.createCharacter(x, y, CharacterType.MAGE, 4);
const orc = spriteManager.createEnemy(x, y, EnemyType.ORC, 4);
```

### Combat Scene Integration:

```typescript
// In CombatScene.ts
private createCombatants() {
  // Player sprite
  const spriteManager = new SpriteManager(this);
  this.playerSprite = spriteManager.createCharacter(200, 300, CharacterType.KNIGHT, 3);

  // Enemy sprite based on enemy name
  const enemyType = this.getEnemyType(this.enemy.name);
  this.enemySprite = spriteManager.createEnemy(800, 300, enemyType, 3);
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
```

## 🎨 Art Style Consistency:

### Color Palette:

- **Metals**: Silver (#C0C0C0), Gold (#FFD700)
- **Skin Tones**: Light (#FFDBAC), Green (#228B22, #8FBC8F)
- **Bone/Undead**: Bone white (#F5F5DC), Gray (#DCDCDC)
- **Eyes**: Red (#FF0000), Orange (#FF4500), Black (#000000)
- **Clothing**: Various browns, blues, greens, white, black
- **Weapons**: Silver (#C0C0C0), Brown handles (#8B4513)

### Technical Specs:

- **Format**: Pure SVG with `<rect>` elements only
- **Grid**: 32×32 pixels per sprite
- **Scaling**: Optimized for 2x, 4x, 8x integer scaling
- **File Size**: ~1-2KB per sprite
- **Background**: Transparent
- **Rendering**: Use `image-rendering: pixelated` for crisp edges

## 🚀 Ready for Knight's Gambit!

**Complete sprite collection ready!** Your roguelike board game now has:

- ✅ **10 total sprites** (6 characters + 4 enemies)
- ✅ **Perfect GameManager integration** - enemies match the code
- ✅ **Scalable SVG format** - crisp at any size
- ✅ **Consistent pixel art style** - authentic 16-bit aesthetic
- ✅ **Easy Phaser integration** - SpriteManager handles everything
- ✅ **Preview pages** - view all sprites in browser

## 🔍 Preview Your Sprites:

- **Characters**: Open `assets/character-preview.html`
- **Enemies**: Open `assets/enemy-preview.html`

Your Knight's Gambit game is now visually complete with professional pixel art sprites for all characters and enemies! 🏰⚔️🐉
