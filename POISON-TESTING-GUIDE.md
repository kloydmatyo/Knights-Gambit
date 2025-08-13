# 🧪 Poison System Testing Guide

## ✅ New Test Button Added: "SIMULATE TURN"

### 🎮 Testing Controls:

**Button Controls:**
- **"TEST EVENT"** (left of dice) - Triggers random events
- **"ROLL DICE"** (center) - Normal gameplay movement
- **"SIMULATE TURN"** (right of dice) - Simulates turn without movement

**Keyboard Shortcuts:**
- **'E' key** - Trigger random event
- **'T' key** - Simulate turn
- **Mouse clicks** - Use buttons

## 🔬 How to Test the Poison System:

### Step 1: Get Poisoned
1. **Start the game**: `npm run electron`
2. **Click "TEST EVENT"** or press 'E' repeatedly until you get:
   - **"Poisonous trap!"** (purple message)
3. **Check UI**: Should show **☠️ POISONED** in status area
4. **Note your health**: Remember current HP

### Step 2: Test Poison Damage
1. **Click "SIMULATE TURN"** or press 'T'
2. **Watch for message**: "Turn simulated! Poison deals 3 damage!"
3. **Check health**: Should decrease by 3 HP
4. **Repeat**: Click "SIMULATE TURN" multiple times
5. **Status persists**: ☠️ POISONED remains until cured

### Step 3: Test Antidote
1. **While poisoned**, click "TEST EVENT" or press 'E' until you get:
   - **"Found an antidote!"** (green message)
2. **Check status**: ☠️ POISONED should disappear
3. **New status**: Should show **💚 HEALING**
4. **Click "SIMULATE TURN"**: Should heal 5 HP per turn

### Step 4: Test Shop Antidote
1. **Get poisoned** again (repeat Step 1)
2. **Ensure you have 25+ coins**
3. **Land on purple shop tile** or use "TEST EVENT" until shop appears
4. **Click "Antidote - 25 coins"**
5. **Poison cured**: Status should change to 💚 HEALING

## 🎯 Complete Testing Scenario:

### Poison Death Test:
1. **Get poisoned** (TEST EVENT until "Poisonous trap!")
2. **Reduce health** to low amount (use witch curse events)
3. **Click "SIMULATE TURN"** repeatedly
4. **Watch health decrease** by 3 each turn
5. **Death message**: "You died from poison!" when health reaches 1

### Antidote Healing Test:
1. **Get poisoned** and take some damage
2. **Find antidote** (TEST EVENT until "Found an antidote!")
3. **Click "SIMULATE TURN"** multiple times
4. **Watch healing**: +5 HP per turn for 3 turns
5. **Status expires**: 💚 HEALING disappears after 3 turns

### Mysterious Herb Test:
1. **Get poisoned**
2. **TEST EVENT** until you get "Mysterious herb!"
3. **50% chance**: Either cures poison or has no effect
4. **Try multiple times** to see both outcomes

## 📊 What to Look For:

### ✅ Working Correctly:
- **Status display**: ☠️ POISONED and 💚 HEALING appear in UI
- **Damage per turn**: Poison deals exactly 3 damage
- **Healing per turn**: Antidote heals exactly 5 HP
- **Status persistence**: Poison continues until cured
- **Shop functionality**: Can buy antidote for 25 coins
- **Death condition**: Game ends when poisoned player reaches 1 HP

### ❌ Issues to Report:
- Status effects not showing in UI
- Poison not dealing damage per turn
- Antidote not curing poison
- Shop not working
- Game not ending on poison death

## 🎮 Testing Combinations:

### Rapid Testing:
1. **Press 'E'** repeatedly to cycle through events
2. **Press 'T'** to simulate turns and see status effects
3. **Watch UI** for status changes
4. **Test all events**: Poison, antidote, herb, shop

### Realistic Gameplay:
1. **Roll dice** and move around board naturally
2. **Land on event tiles** (gray "?")
3. **Visit shops** (purple tiles)
4. **Experience poison** during normal play

## 🔧 Debug Information:

### Console Messages:
- Open **F12 Developer Tools**
- Check **Console** for any error messages
- Look for status effect application logs

### UI Elements:
- **Top-left corner**: Health, coins, attack, defense, floor
- **Status line**: Shows active status effects
- **Messages**: Center screen for event results

## 🚀 Expected Results:

The poison system should provide:
- **Strategic depth**: Players must manage poison risk
- **Resource management**: Save coins for antidotes
- **Shop importance**: Shops become valuable for survival
- **Turn-based tension**: Each turn matters when poisoned
- **Clear feedback**: Always know your status

## 🎯 Quick Test Sequence:

1. **Start game** → **Press 'E'** until poisoned → **Check ☠️ POISONED**
2. **Press 'T'** → **Watch health decrease** → **See poison damage message**
3. **Press 'E'** until antidote → **Check 💚 HEALING** → **Press 'T'** → **Watch healing**
4. **Test complete!** ✅

The "SIMULATE TURN" button makes it easy to test status effects without having to play through the entire game loop! 🧪⚔️