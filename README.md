# Knight's Gambit - Advanced Roguelike Board Game RPG

A comprehensive 2D roguelike board-game RPG featuring 6 unique character classes, 18 distinct skills, and strategic turn-based combat. Built with Phaser 3, TypeScript, and Electron.

## Game Concept

Choose from 6 unique character classes and embark on an epic adventure through a 15-floor dungeon. Roll dice to move around a circular board, encountering enemies, treasures, shops, and special events. Each class offers distinct playstyles with active and passive abilities that define your strategic approach.

## Features

### Character Classes & Skills System

- **6 Unique Classes**: Knight, Archer, Mage, Barbarian, Assassin, Cleric
- **18 Distinct Skills**: 3 skills per class (active and passive abilities)
- **Class-Specific Stats**: Each class has unique health, attack, defense, and starting resources
- **Interactive Selection**: Detailed class information with stats and skill descriptions
- **Strategic Depth**: Skills with cooldowns, mana costs, and tactical applications

### Advanced Combat System

- **Turn-Based Strategy**: Attack, defend, run, or use class skills
- **Skill Integration**: All 18 skills fully functional in combat
- **Status Effects**: Poison, regeneration, blessing, rage, and more
- **Visual Feedback**: Comprehensive combat log and effect indicators
- **Class Identity**: Each class feels unique in battle

### Comprehensive Progression

- **15-Floor Dungeon**: Progressive difficulty with special floors
- **Shop System**: Regular items and special shop floors (4, 8, 12)
- **Status Effects**: Complex buff/debuff system with duration tracking
- **Floor Progression**: Seamless advancement with floor-specific mechanics
- **Resource Management**: Health, mana, coins, and cooldowns

### Enhanced Gameplay Features

- **Circular Board**: 20-tile looping board with 6 different tile types
- **Dice Rolling**: Strategic movement with skill-based positioning
- **Multiple Tile Events**:
  - Enemy tiles → Class-based tactical combat
  - Treasure tiles → Coins and stat bonuses
  - Shop tiles → Equipment and consumables
  - Event tiles → Random effects and encounters
  - Boss tiles → Challenging special encounters
  - Start tiles → Floor progression and special shops

### Technical Excellence

- **Professional UI**: 1400x900 responsive interface
- **Advanced State Management**: Comprehensive game state persistence
- **Skill Framework**: Extensible system for abilities and effects
- **Visual Polish**: Animations, tooltips, and clear feedback
- **Development Tools**: Built-in testing and debugging features

## Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Development (Web):**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser

3. **Development (Electron):**

   ```bash
   npm run electron-dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Build Electron app:**
   ```bash
   npm run dist
   ```

## Project Structure

```
src/
├── scenes/           # Phaser scenes
│   ├── MenuScene.ts     # Main menu
│   ├── GameScene.ts     # Main gameplay
│   └── CombatScene.ts   # Turn-based combat
├── managers/         # Game logic managers
│   ├── GameManager.ts   # Core game state
│   └── BoardManager.ts  # Board generation and rendering
├── types/           # TypeScript type definitions
│   └── GameTypes.ts    # Game interfaces and enums
└── main.ts          # Entry point
```

## Game Controls

- **Roll Dice**: Click the "ROLL DICE" button to move
- **Combat**: Use Attack, Defend, or Run buttons during battles
- **Navigation**: Click buttons to navigate menus

## Implementation Status

### Phase 1 (COMPLETE ✅) - Core Systems

- [x] **Advanced board generation and movement** - 20-tile circular board with animations
- [x] **Comprehensive turn-based combat** - Attack, defend, run, and skill usage
- [x] **Complete tile events system** - All 6 tile types fully functional
- [x] **Advanced player progression** - Stats, levels, and status effects
- [x] **Robust save system** - localStorage with full state persistence

### Phase 2 (COMPLETE ✅) - Advanced Features

- [x] **Character class system** - 6 unique classes with distinct abilities
- [x] **Comprehensive skills system** - 18 skills with active/passive mechanics
- [x] **Advanced shop system** - Regular and special shops with validation
- [x] **Multi-floor progression** - 15 floors with special mechanics
- [x] **Status effects engine** - Complex buff/debuff system
- [x] **Professional UI/UX** - Enhanced interface and visual feedback

### Phase 3 (IN PROGRESS 🚧) - Polish & Expansion

- [x] **Enhanced inventory system** - Equipment slots and item management
- [x] **Advanced boss battles** - Special encounters with unique mechanics
- [ ] **Pixel art assets** - Custom sprites and animations
- [ ] **Audio system** - Sound effects and background music
- [ ] **Achievement system** - Progress tracking and rewards
- [ ] **Difficulty modes** - Multiple challenge levels

### Phase 4 (PLANNED 📋) - Extended Content

- [ ] **Permanent progression** - Meta-progression between runs
- [ ] **Extended enemy variety** - More enemy types and AI behaviors
- [ ] **Legendary items** - Rare equipment with special effects
- [ ] **Online features** - Leaderboards and sharing
- [ ] **Mobile optimization** - Touch controls and responsive design
- [ ] **Mod support** - Custom content creation tools

## Current Game State

**Knight's Gambit** has evolved into a comprehensive roguelike RPG featuring:

- **6 Unique Character Classes** with distinct abilities and playstyles
- **18 Fully Functional Skills** integrated into strategic combat
- **Advanced Equipment System** with enchantments and rarity tiers
- **15-Floor Dungeon** with progressive difficulty and special events
- **Professional UI/UX** with comprehensive feedback and polish
- **Complete Save System** with full state persistence

The game currently uses placeholder graphics but features complete gameplay systems ready for visual and audio enhancement.

## Development Status

**Phase 1 & 2: COMPLETE ✅**
- All core systems implemented and polished
- Advanced features exceed original scope
- Professional-quality gameplay experience
- Ready for Phase 3 enhancements

**Phase 3: IN PROGRESS 🚧**
- Custom pixel art assets
- Sound effects and background music
- Achievement system
- Extended content and features

## Technical Excellence

- **TypeScript/Phaser 3** - Modern web game development
- **Electron Support** - Cross-platform desktop application
- **Modular Architecture** - Clean, maintainable codebase
- **Comprehensive Testing** - All systems verified and balanced
- **Performance Optimized** - Smooth gameplay experience

## License

MIT License - Feel free to use and modify for your own projects!

---

**Knight's Gambit** - *A testament to what can be achieved with modern web game development technologies and thoughtful system design.* ⚔️🎮✨
