# 🎨 Knight's Gambit - Pixel Art Sprites

## 📁 Files Created

### Main Spritesheet
- **`assets/characters.svg`** - Combined spritesheet (192×32) with all 6 characters
- **`assets/character-preview.html`** - Preview page to view all characters

### Individual Character Files
- **`assets/knight.svg`** - Knight sprite (32×32)
- **`assets/archer.svg`** - Archer sprite (32×32)
- **`assets/mage.svg`** - Mage sprite (32×32) 
- **`assets/barbarian.svg`** - Barbarian sprite (32×32)
- **`assets/assassin.svg`** - Assassin sprite (32×32)
- **`assets/cleric.svg`** - Cleric sprite (32×32)

### Integration Code
- **`src/managers/SpriteManager.ts`** - Phaser integration helper

## 🎯 Character Designs

### 🛡️ Knight
- **Colors**: Silver armor (#C0C0C0), gold visor (#FFD700)
- **Features**: Steel helmet, full armor, sword
- **Style**: Classic medieval knight

### 🏹 Archer  
- **Colors**: Green tunic (#228B22), brown leather (#8B4513)
- **Features**: Bow drawn, quiver on back, forest ranger look
- **Style**: Robin Hood inspired

### 🔮 Mage
- **Colors**: Blue robes (#4169E1), golden staff orb (#FFD700)
- **Features**: Pointed wizard hat, glowing staff, mystical aura
- **Style**: Classic fantasy wizard

### ⚔️ Barbarian
- **Colors**: Tan skin (#FFDBAC), brown leather (#8B4513)
- **Features**: Bare chest, leather armor, large battle axe
- **Style**: Conan-inspired warrior

### 🗡️ Assassin
- **Colors**: Black hood/cloak (#000000), red eyes (#FF0000)
- **Features**: Hidden face, dual daggers, stealthy pose
- **Style**: Dark, mysterious, ninja-like

### ✨ Cleric
- **Colors**: White robes (#FFFFFF), golden cross (#FFD700)
- **Features**: Holy staff, healing aura, peaceful demeanor
- **Style**: Divine healer, priest-like

## 🔧 Technical Specifications

### SVG Structure
- **Format**: Pure SVG using only `<rect>` elements
- **Grid**: 32×32 pixel blocks per character
- **Colors**: Solid fills only (no gradients)
- **Background**: Transparent
- **IDs**: Each character has unique ID attribute

### Spritesheet Layout
```
[Knight][Archer][Mage][Barbarian][Assassin][Cleric]
  0-31   32-63  64-95   96-127    128-159  160-191
```

### File Sizes
- Individual SVGs: ~1-2KB each
- Combined spritesheet: ~6KB
- Highly optimized for web/Electron

## 🎮 Phaser Integration

### Method 1: Individual Files
```typescript
// In preload()
this.load.svg('knight', 'assets/knight.svg');
this.load.svg('archer', 'assets/archer.svg');

// In create()
const knight = this.add.image(x, y, 'knight').setScale(4);
const archer = this.add.image(x, y, 'archer').setScale(4);
```

### Method 2: Spritesheet (Recommended)
```typescript
// In preload()
this.load.svg('characters', 'assets/characters.svg', { width: 192, height: 32 });

// In create() - would need texture atlas for proper frame extraction
const knight = this.add.image(x, y, 'characters');
// Note: SVG spritesheets need special handling in Phaser
```

### Method 3: Using SpriteManager
```typescript
import { SpriteManager, CharacterType } from './managers/SpriteManager';

// In scene
const spriteManager = new SpriteManager(this);
spriteManager.preloadCharacters();

const knight = spriteManager.createCharacterSprite(x, y, CharacterType.KNIGHT, 4);
```

## 🎨 Customization

### Color Palette
All characters use a consistent 16-color palette:
- **Metals**: #C0C0C0 (silver), #FFD700 (gold)
- **Skin**: #FFDBAC (light), #8B4513 (tan)
- **Cloth**: #FFFFFF (white), #000000 (black), #4169E1 (blue), #228B22 (green)
- **Leather**: #654321 (dark brown), #8B4513 (brown), #A0522D (light brown)
- **Accents**: #FF0000 (red), #FFFF00 (bright yellow), #32CD32 (bright green)

### Scaling
- **Recommended scales**: 2x, 4x, 8x for crisp pixel art
- **CSS**: Use `image-rendering: pixelated` for sharp edges
- **Phaser**: Use integer scale values (2, 4, 8) not decimals

## 📱 Usage Tips

### For Sharp Pixel Art
```css
.pixel-art {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### For Phaser
```typescript
// Ensure crisp pixel rendering
this.game.config.render.pixelArt = true;
this.game.config.render.antialias = false;
```

## 🎯 Preview

Open `assets/character-preview.html` in your browser to see all characters rendered at different sizes with the proper pixel art styling.

## 🚀 Ready for Knight's Gambit!

These sprites are optimized for your roguelike board game and will scale beautifully from small board pieces to large character portraits. Each character has a distinct visual identity that matches classic RPG archetypes while maintaining the authentic 16-bit pixel art aesthetic.

Perfect for use in combat scenes, character selection, or as player avatars! 🏰⚔️