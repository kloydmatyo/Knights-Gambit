# Knight's Gambit - Strategic Rebuild Plan

## Architecture Overview

### Hybrid Architecture: Phaser + React/Next.js

**Phaser Responsibilities:**
- Game board canvas rendering
- Combat animations and visuals
- Sprite management
- Game loop for animations

**React Responsibilities:**
- All UI components (menus, HUD, modals)
- Layout and responsive design
- State management
- Navigation and routing
- User interactions outside canvas

## Project Structure

```
knights-gambit/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Landing pages (SEO)
│   │   ├── page.tsx             # Home/landing
│   │   └── about/
│   ├── game/                    # Game routes
│   │   ├── page.tsx             # Game container
│   │   ├── layout.tsx           # Game layout
│   │   └── loading.tsx          # Loading state
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── game/                    # Game-specific components
│   │   ├── HUD.tsx              # Heads-up display
│   │   ├── CharacterSelection.tsx
│   │   ├── Inventory.tsx
│   │   ├── CombatUI.tsx
│   │   └── GameBoard.tsx        # Phaser container
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── features/                     # Feature modules
│   ├── combat/
│   │   ├── combat.engine.ts     # Pure logic
│   │   ├── combat.types.ts
│   │   └── useCombat.ts         # React hook
│   ├── inventory/
│   │   ├── inventory.engine.ts
│   │   ├── inventory.types.ts
│   │   └── useInventory.ts
│   ├── characters/
│   │   ├── character.engine.ts
│   │   ├── character.types.ts
│   │   └── useCharacter.ts
│   └── board/
│       ├── board.engine.ts
│       ├── board.types.ts
│       └── useBoard.ts
│
├── lib/                          # Core libraries
│   ├── game-engine/             # Pure game logic
│   │   ├── GameEngine.ts        # Main engine
│   │   ├── rules.ts             # Game rules
│   │   └── calculations.ts      # Math/formulas
│   ├── phaser/                  # Phaser integration
│   │   ├── PhaserGame.ts        # Phaser wrapper
│   │   ├── scenes/              # Minimal Phaser scenes
│   │   │   ├── BoardScene.ts    # Board rendering only
│   │   │   └── CombatScene.ts   # Combat visuals only
│   │   └── bridge.ts            # Phaser-React bridge
│   └── utils/
│       ├── constants.ts
│       └── helpers.ts
│
├── store/                        # State management
│   ├── index.ts                 # Store setup
│   ├── gameSlice.ts             # Game state
│   ├── uiSlice.ts               # UI state
│   └── types.ts                 # Store types
│
├── hooks/                        # Custom React hooks
│   ├── useGameState.ts
│   ├── useResponsive.ts
│   └── usePhaserBridge.ts
│
├── public/                       # Static assets
│   └── assets/                  # Game assets
│       ├── sprites/
│       ├── audio/
│       └── images/
│
└── types/                        # Global TypeScript types
    ├── game.types.ts
    └── index.ts
```

## Implementation Phases

### Phase 1: Foundation (Current)
- [x] Create project structure
- [ ] Setup Zustand store
- [ ] Create base UI components
- [ ] Setup Tailwind configuration
- [ ] Create Phaser-React bridge

### Phase 2: Core Systems
- [ ] Implement game engine (pure logic)
- [ ] Create character system
- [ ] Build inventory system
- [ ] Implement combat logic

### Phase 3: UI Layer
- [ ] Character selection screen (React)
- [ ] Game HUD component
- [ ] Inventory UI
- [ ] Combat UI overlay

### Phase 4: Phaser Integration
- [ ] Board rendering scene
- [ ] Combat animation scene
- [ ] Sprite management
- [ ] Event system

### Phase 5: Responsive & Mobile
- [ ] Responsive layouts
- [ ] Touch controls
- [ ] Mobile-optimized UI
- [ ] Gesture support

### Phase 6: Polish & Deploy
- [ ] Animations and transitions
- [ ] Performance optimization
- [ ] SEO and landing page
- [ ] Deployment configuration

## Key Architectural Decisions

1. **State Management**: Zustand (lightweight, no boilerplate)
2. **Styling**: Tailwind CSS (utility-first, responsive)
3. **Animations**: Framer Motion (smooth, declarative)
4. **Phaser Usage**: Minimal - only for canvas rendering
5. **Type Safety**: Strict TypeScript throughout

## Migration Strategy

- Keep existing code in `/game` and `/src` folders
- Build new architecture in parallel
- Migrate game logic incrementally
- Test each feature before removing old code
- Final cleanup after full migration

## Success Metrics

- [ ] All UI responsive on mobile/tablet/desktop
- [ ] Game logic separated from rendering
- [ ] No Phaser code in React components
- [ ] No React code in Phaser scenes
- [ ] 90+ Lighthouse score
- [ ] < 3s initial load time
- [ ] Deployable to Vercel with one command
