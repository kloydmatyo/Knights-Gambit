# Next.js Migration Fixes Applied

## Issues Fixed

### 1. Phaser Import Error
**Problem**: Phaser doesn't have a default export in ES modules
**Solution**: Changed all imports from `import Phaser from 'phaser'` to `import * as Phaser from 'phaser'`

**Files Updated**:
- `components/GameComponent.tsx`
- `game/scenes/MenuScene.ts`
- `game/scenes/GameScene.ts`
- `game/scenes/ClassSelectionScene.ts`
- `game/scenes/CombatScene.ts`
- `game/scenes/SpriteTestScene.ts`
- `game/managers/BoardManager.ts`

### 2. Viewport Metadata Warning
**Problem**: Next.js 14 requires viewport configuration in a separate export
**Solution**: Moved viewport settings from metadata to dedicated `viewport` export

**File Updated**: `app/layout.tsx`

### 3. Browserslist Outdated
**Problem**: caniuse-lite database was outdated
**Solution**: Ran `npx update-browserslist-db@latest`

## Current Status

All import errors resolved. The game should now run without warnings in Next.js.

## Testing

Run the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to test the game.
