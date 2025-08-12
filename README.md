# Heroll - Roguelike Board Game RPG

A 2D pixel art roguelike board-game RPG built with Phaser 3, TypeScript, and Electron.

## Game Concept

Travel around a looping circular board as a hero, rolling dice to move forward. Each tile triggers different events: battles, shops, treasure, random events, or boss fights. The board resets with new enemies and loot after each loop (floor).

## Features

### Core Gameplay
- **Circular Board**: 20-tile looping board with different tile types
- **Dice Rolling**: Roll 1-6 to move around the board
- **Turn-Based Combat**: Strategic combat with attack, defend, and run options
- **Tile Events**: 
  - Enemy tiles → Turn-based combat
  - Treasure tiles → Coins and items
  - Shop tiles → Buy equipment (coming soon)
  - Event tiles → Random effects
  - Boss tiles → Special encounters (coming soon)

### Progression System
- Health, attack, and defense stats
- Coin collection and spending
- Equipment system (planned)
- Floor progression with increasing difficulty

### Technical Features
- Built with Phaser 3 and TypeScript
- Electron desktop app support
- Local save system using localStorage
- Responsive design for desktop and mobile

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

## Roadmap

### Phase 1 (Current - MVP)
- [x] Basic board generation and movement
- [x] Turn-based combat system
- [x] Basic tile events (enemy, treasure, event)
- [x] Player stats and progression
- [x] Local save system

### Phase 2 (Planned)
- [ ] Shop system with equipment
- [ ] Inventory management
- [ ] Boss battles
- [ ] Multiple floors/stages
- [ ] Pixel art assets
- [ ] Sound effects and music

### Phase 3 (Future)
- [ ] Permanent progression between runs
- [ ] More enemy types and abilities
- [ ] Special items and abilities
- [ ] Online leaderboards
- [ ] Mobile app version

## Development Notes

The game uses simple colored rectangles as placeholders for pixel art. The core gameplay loop is functional and ready for art assets and additional features.

## License

MIT License - Feel free to use and modify for your own projects!