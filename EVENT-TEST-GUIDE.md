# 🎲 How to Test Events in Knight's Gambit

## 🎯 What Events Do:

The events in `handleEventTile()` modify your character's stats when you land on gray "?" tiles. Here's what each event does:

### 📋 Available Events:

1. **🧪 Healing Potion** (Green)
   - Restores +20 health (up to max)
   - Message: "Found a healing potion!"
   - Result: "Healed X HP!" or "Already at full health!"

2. **🧙‍♀️ Witch's Curse** (Red)
   - Reduces health by -5 (minimum 1)
   - Message: "Cursed by a witch!"
   - Result: "Lost 5 health!"

3. **💰 Lucky Find** (Yellow)
   - Adds +15 coins
   - Message: "Lucky find!"
   - Result: "Found 15 coins!"

4. **⚔️ Sword Upgrade** (Orange)
   - Increases attack by +3
   - Message: "Found a Sword!"
   - Result: "Attack increased by 3!"

## 🔍 How to Test Events:

### Method 1: Natural Gameplay
1. Start the game (`npm run electron`)
2. Roll dice and move around the board
3. Look for **gray tiles with "?"** symbol
4. Land on them to trigger random events
5. Watch your stats change in the top-left UI

### Method 2: Debug Button (Added)
1. Start the game
2. Look for the **"TEST EVENT"** button next to "ROLL DICE"
3. Click it to instantly trigger a random event
4. No need to move around the board!

## 📊 Visual Feedback:

When an event triggers, you'll see:
- **Main message** in the center (colored by event type)
- **Result message** below it showing what changed
- **Animated appearance** with scaling and fade-in
- **UI updates** showing new health/coins/attack values

## 🎮 UI Elements to Watch:

Top-left corner shows:
- **Health**: Current/Max (red text)
- **Coins**: Total coins (yellow text)  
- **Attack**: Current attack power (orange text)
- **Floor**: Current floor number (cyan text)

## ✅ How to Verify Events Work:

1. **Note your starting stats** (Health: 100/100, Coins: 50, Attack: 15)
2. **Click "TEST EVENT"** multiple times
3. **Watch the numbers change** in the UI
4. **See different colored messages** for different event types

The events are working if you see:
- Messages appearing in the center of the screen
- Numbers changing in the top-left UI
- Different colors for different event types
- Smooth animations when messages appear

## 🐛 Troubleshooting:

If events don't seem to work:
- Check that the UI numbers are updating
- Look for error messages in the browser console (F12)
- Make sure you're clicking the "TEST EVENT" button
- Try landing on gray "?" tiles naturally by rolling dice

The event system is fully functional and provides immediate visual feedback! 🎯