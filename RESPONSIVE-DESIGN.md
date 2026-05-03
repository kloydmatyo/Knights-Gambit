# Responsive Design Implementation

## Overview
This game has been refactored to support responsive design across all screen sizes and aspect ratios, with special attention to mobile usability.

## Key Features

### 1. Flexible Layouts
- **CSS Custom Properties**: Using `clamp()` and viewport units for fluid sizing
- **Responsive Breakpoints**: 
  - Mobile: < 640px
  - Small Mobile: < 480px  
  - Landscape Mobile: < 500px height
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

### 2. Mobile-First Approach
- Touch-friendly buttons (minimum 44px touch targets)
- Safe area insets for notched devices
- Dynamic viewport height (dvh) support
- Optimized for portrait and landscape orientations

### 3. Responsive Components

#### HUD (Heads-Up Display)
- **Width**: `clamp(140px, 25vw, 240px)` - scales with viewport
- **Font sizes**: Responsive from 10px to 14px
- **Spacing**: Adaptive padding and gaps
- **Position**: Safe area aware (top-left and top-right)

#### CombatUI
- **Stage Height**: `clamp(280px, 50vh, 520px)` - adapts to screen
- **Sprite Scaling**: 
  - Player: `w-20 sm:w-32 md:w-40` (80px → 160px)
  - Enemy: `scale-75 sm:scale-100` (75% → 100%)
- **Bottom Panel**: Stacks vertically on mobile (`grid-cols-1 sm:grid-cols-2`)
- **Button Sizes**: `py-2.5 sm:py-4` with responsive text

#### Shop & Inventory Panels
- **Max Width**: `min(90vw, 640px)` - never exceeds viewport
- **Height**: `clamp(400px, 75vh, 800px)` - fluid with limits
- **Padding**: `p-2 sm:p-4` - tighter on mobile
- **Touch Targets**: All buttons meet 44px minimum

#### Dice Roller / Path Chooser
- **Button Size**: Scales from `px-4 py-3` to `px-16 py-8`
- **Font Size**: `text-sm sm:text-base md:text-2xl`
- **Position**: Safe bottom area aware

### 4. CSS Utilities

#### Custom Properties (in `globals.css`)
```css
--spacing-xs: clamp(0.25rem, 1vw, 0.5rem);
--spacing-sm: clamp(0.5rem, 2vw, 0.75rem);
--spacing-md: clamp(0.75rem, 2.5vw, 1rem);
--spacing-lg: clamp(1rem, 3vw, 1.5rem);
--spacing-xl: clamp(1.5rem, 4vw, 2rem);

--font-xs: clamp(0.625rem, 1.5vw, 0.75rem);
--font-sm: clamp(0.75rem, 2vw, 0.875rem);
--font-base: clamp(0.875rem, 2.5vw, 1rem);
--font-lg: clamp(1rem, 3vw, 1.125rem);
--font-xl: clamp(1.125rem, 3.5vw, 1.25rem);
--font-2xl: clamp(1.25rem, 4vw, 1.5rem);
--font-3xl: clamp(1.5rem, 5vw, 1.875rem);

--hud-width: clamp(180px, 25vw, 240px);
--button-height: clamp(2.5rem, 6vh, 3.5rem);
--modal-max-width: min(90vw, 900px);
--modal-max-height: min(90vh, 800px);
```

#### Utility Classes
- `.no-select` - Prevents text selection on game elements
- `.btn-touch` - Ensures minimum 44px touch targets
- `.safe-top/bottom/left/right` - Safe area insets for notched devices
- `.scroll-smooth-mobile` - Smooth scrolling with touch support
- `.game-container` - Full viewport container with overflow handling
- `.modal-responsive` - Responsive modal sizing

### 5. Accessibility

#### Touch Optimization
- Minimum 44px touch targets (iOS/Android standard)
- `touch-action: manipulation` to prevent double-tap zoom
- `-webkit-tap-highlight-color: transparent` for cleaner UX

#### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

#### High DPI Support
- Font smoothing for retina displays
- Pixel-perfect rendering for game sprites

### 6. Performance Optimizations

#### Mobile-Specific
- Reduced animation complexity on small screens
- Optimized sprite scaling
- Efficient layout recalculation
- Hardware-accelerated transforms

#### Landscape Mode
- Compressed spacing in landscape orientation
- Reduced button heights
- Optimized for limited vertical space

### 7. Testing Checklist

#### Screen Sizes
- [ ] iPhone SE (375 x 667)
- [ ] iPhone 12/13/14 (390 x 844)
- [ ] iPhone 14 Pro Max (430 x 932)
- [ ] Samsung Galaxy S21 (360 x 800)
- [ ] iPad Mini (768 x 1024)
- [ ] iPad Pro (1024 x 1366)
- [ ] Desktop (1920 x 1080)

#### Orientations
- [ ] Portrait mode
- [ ] Landscape mode
- [ ] Rotation transitions

#### Features
- [ ] Touch targets are at least 44px
- [ ] No horizontal scrolling
- [ ] Safe areas respected on notched devices
- [ ] Text remains readable at all sizes
- [ ] Buttons don't overlap
- [ ] Modals fit within viewport
- [ ] Combat UI scales properly
- [ ] HUD doesn't obstruct gameplay

### 8. Browser Support

#### Tested Browsers
- Chrome/Edge (latest)
- Safari iOS (latest)
- Firefox (latest)
- Samsung Internet (latest)

#### CSS Features Used
- CSS Custom Properties
- `clamp()` function
- `min()` / `max()` functions
- CSS Grid
- Flexbox
- `dvh` (dynamic viewport height)
- `env(safe-area-inset-*)`

### 9. Known Limitations

1. **Very Small Screens** (< 320px): Some UI elements may be cramped
2. **Very Large Screens** (> 2560px): UI caps at maximum sizes
3. **Extreme Aspect Ratios**: Tested for 16:9 to 21:9, may need adjustments beyond

### 10. Future Improvements

- [ ] Add pinch-to-zoom for character creator
- [ ] Implement swipe gestures for navigation
- [ ] Add haptic feedback for mobile
- [ ] Optimize for foldable devices
- [ ] Add PWA support for offline play
- [ ] Implement adaptive UI density based on screen size

## Development Guidelines

### Adding New Components

When creating new components, follow these patterns:

```tsx
// Use responsive classes
<div className="p-2 sm:p-4 md:p-6">
  <h2 className="text-sm sm:text-base md:text-lg">Title</h2>
  <button className="btn-touch no-select">Action</button>
</div>

// Use CSS custom properties
<div style={{ 
  width: 'var(--hud-width)',
  padding: 'var(--spacing-md)'
}}>
  Content
</div>

// Use clamp for fluid sizing
<div style={{
  fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
  padding: 'clamp(0.5rem, 2vw, 1rem)'
}}>
  Content
</div>
```

### Testing Responsive Changes

```bash
# Use browser dev tools
# Chrome: Cmd+Shift+M (Mac) / Ctrl+Shift+M (Windows)
# Test multiple device presets
# Check both portrait and landscape

# Test on real devices when possible
# Use remote debugging for mobile browsers
```

## Conclusion

The game now provides a consistent, usable experience across all device types and screen sizes. The responsive design prioritizes mobile usability while maintaining the full desktop experience.
