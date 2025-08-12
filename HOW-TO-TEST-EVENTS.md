# 🎯 How to Test Events in Knight's Gambit

## 🎮 Two Ways to Test Events:

### Method 1: TEST EVENT Button
1. **Start the game**: `npm run electron`
2. **Look for the button**: "TEST EVENT" button is positioned to the LEFT of "ROLL DICE"
3. **Click it**: Each click triggers a random event
4. **Watch the results**: See messages and stat changes

### Method 2: Keyboard Shortcut ⌨️
1. **Start the game**: `npm run electron`
2. **Press the 'E' key**: Instantly triggers a random event
3. **Press repeatedly**: Test multiple events quickly
4. **Watch your stats**: Health, coins, and attack will change

## 📊 What to Look For:

### Visual Feedback:
- **Animated messages** appear in the center of the screen
- **Two-line display**: Event name + result description
- **Color coding**: Different colors for different event types
- **Smooth animations**: Messages fade in with scaling effect

### Stat Changes (Top-Left UI):
- **Health**: Red text - watch for healing/damage
- **Coins**: Yellow text - watch for money changes  
- **Attack**: Orange text - watch for weapon upgrades
- **Floor**: Cyan text - shows current floor

## 🎲 Event Types You'll See:

1. **🧪 Healing Potion** (Green)
   - Message: "Found a healing potion!"
   - Effect: +20 health (up to maximum)
   - Result: "Healed X HP!" or "Already at full health!"

2. **🧙‍♀️ Witch's Curse** (Red)
   - Message: "Cursed by a witch!"
   - Effect: -5 health (minimum 1)
   - Result: "Lost 5 health!"

3. **💰 Lucky Find** (Yellow)
   - Message: "Lucky find!"
   - Effect: +15 coins
   - Result: "Found 15 coins!"

4. **⚔️ Sword Upgrade** (Orange)
   - Message: "Found a Sword!"
   - Effect: +3 attack power
   - Result: "Attack increased by 3!"

## 🔍 Testing Tips:

1. **Start with full health** to see healing effects clearly
2. **Note your starting stats**: Health: 100/100, Coins: 50, Attack: 15
3. **Test multiple times** to see all 4 event types
4. **Watch the UI numbers** change immediately after each event
5. **Use 'E' key** for rapid testing without clicking

## ✅ Verification Checklist:

- [ ] TEST EVENT button is visible (left of ROLL DICE)
- [ ] 'E' key triggers events
- [ ] Messages appear with animations
- [ ] Health numbers change (red text)
- [ ] Coins numbers change (yellow text)
- [ ] Attack numbers change (orange text)
- [ ] Different colored messages for different events
- [ ] Messages disappear after 3 seconds

If you can check all these boxes, the events system is working perfectly! 🎯

## 🎮 Natural Gameplay Testing:

You can also test events naturally by:
1. Rolling dice to move around the board
2. Landing on **gray tiles with "?"** symbols
3. Events trigger automatically when you land on them

The TEST EVENT button and 'E' key are just for quick testing! 🚀