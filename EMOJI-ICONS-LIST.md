# 🎨 Emoji Icons Used in Dicebound

Complete list of all emoji icons used throughout the game.

## 🎮 Combat UI (`components/game/CombatUI.tsx`)

### Status Effects
- 🔥 **Burn** - Fire damage over time
- 🧪 **Poison** - Poison damage over time
- 💀 **Cursed** - Cursed debuff
- ✨ **Blessed** - Blessed buff
- ⚡ **Generic Effect** - Default status effect
- 🛡️ **Shield** - Shield protection

### Combat Actions
- ⚔️ **Fight** - Attack button
- 🎒 **Bag** - Inventory button
- 💰 **Bribe** - Bribe enemy option
- 🤝 **Truce** - Make peace option
- 💬 **Talk** - Talk option
- 🏃 **Run** - Flee from combat

### Other
- 👹 **Enemy Fallback** - Default enemy sprite if missing
- 🛡️ **Player Fallback** - Default player sprite if missing
- 💡 **Hint** - Mobile hint for long-press

## 👤 Character Creator (`components/game/LPCCharacterCreator/index.tsx`)

### Body Categories
- 🧍 **Body** - Body type selection
- 😶 **Head** - Head/face selection
- 💇 **Hair** - Hairstyle selection
- 🎩 **Hat** - Headwear selection
- 👕 **Torso** - Shirt/armor selection
- 💪 **Arms** - Arm equipment
- 👖 **Legs** - Pants/leg armor
- 👟 **Feet** - Footwear selection
- ⚔️ **Weapon** - Weapon selection
- 🔧 **Tools** - Tool selection

### Actions
- 🎲 **Random** - Randomize character button

## 🎲 Game Board (`components/game/GameBoard.tsx`)

### Tile Types
- 🏁 **Start** - Starting tile
- ⬜ **Normal** - Safe tile
- 👹 **Enemy** - Enemy encounter
- 💀 **Elite** - Elite enemy
- 🏪 **Shop** - Shop tile
- ❓ **Event** - Random event
- ☠️ **Boss** - Boss encounter
- ⚠️ **Trap** - Trap tile
- 🔥 **Fire Trap** - Fire trap
- 🗡️ **Spike Trap** - Spike trap
- 🧪 **Poison Trap** - Poison gas trap
- ✓ **Triggered Trap** - Already triggered

### Other
- 🎲 **Player Token** - Player position marker (fallback)
- ❓ **Unknown** - Undiscovered tile

## 🎯 Dice Manipulator (`components/game/DiceManipulator.tsx`)

### Destiny States
- 💀 **Cursed** - Cursed destiny (2-3)
- 📉 **Unlucky** - Unlucky destiny (4-5)
- ⚖️ **Balanced** - Balanced destiny (6-8)
- 📈 **Favored** - Favored destiny (9-10)
- ✨ **Exalted** - Exalted destiny (11-12)

## 🏪 Shop Panel (`components/game/ShopPanel.tsx`)

### Item Types
- 🧪 **Healing Potion** - Health restoration
- 💊 **Antidote** - Cure poison
- ⬆️ **Stat Upgrade** - Permanent stat boost
- 📜 **Blessing Scroll** - Blessing item
- 💎 **Heartstone Amulet** - Special amulet
- 💧 **Holy Water** - Holy item
- 🙏 **Blessing** - Blessing effect
- 🛡️ **Iron Shield** - Shield item
- 🪞 **Mirror Shield** - Special shield
- ✨ **Relic** - Relic item category

### Relic Types
- 🦷 **Vampiric Fang** - Lifesteal relic
- 🫀 **Iron Heart** - Defense relic
- 🥁 **War Drum** - Offense relic
- 🪨 **Stone Skin** - Defense relic
- 🗿 **Cursed Idol** - Risk/reward relic
- 💠 **Philosopher's Stone** - Economy relic
- 💀 **Death Mask** - Combat relic
- 🏆 **Golden Chalice** - Economy relic
- ⏳ **Hourglass Shard** - Utility relic

### Shop UI
- 🧪 **Consumables Tab** - Consumables category
- ⬆️ **Upgrades Tab** - Upgrades category
- ✨ **Relics Tab** - Relics category
- ⚔️ **Weapons Tab** - Weapons category
- 💰 **Coins** - Currency display
- 📈 **Next Upgrade** - Next upgrade cost
- ⚡ **Instant** - Auto-consume badge
- 🌟 **Special** - Special ability badge

## 📊 HUD (`components/game/HUD.tsx`)

### Stats
- ⚔️ **Attack** - Attack stat
- 🛡️ **Defense** - Defense stat
- 🗡️ **Armor Pen** - Armor penetration
- ⚡ **Crit Chance** - Critical hit chance
- 💥 **Crit Damage** - Critical damage multiplier
- ✨ **Mana** - Mana bar
- 🛡️ **Shield** - Shield bar

### Other
- 📦 **Inventory** - Inventory button
- 💰 **Coins** - Currency display

## 🎮 Main Game (`app/game/page.tsx`)

### Notifications
- 📈 **Favored Bonus** - HP bonus from favored destiny
- 💀 **Cursed Penalty** - Damage from cursed destiny
- 📉 **Unlucky Penalty** - Damage from unlucky destiny
- 🏃 **Flee Success** - Successfully fled
- 🏃 **Flee Failed** - Failed to flee
- 💰 **Bribe Success** - Bribe accepted
- 💰 **Bribe Failed** - Bribe rejected
- 🤝 **Truce Success** - Truce accepted
- 🤝 **Truce Rejected** - Truce failed

### Debug Messages
- 💀 **Cursed Combat** - Debug cursed enemy
- 📉 **Unlucky Combat** - Debug unlucky enemy
- 📈 **Favored Combat** - Debug favored enemy

## 🎲 Dice Roller (`components/game/DiceRoller.tsx`)

### Dice Faces
- 🎲 **Generic Dice** - Default dice icon

## 📦 Inventory Panel (`components/game/InventoryPanel.tsx`)

### Item Actions
- 🧪 **Use Item** - Use consumable
- 🗑️ **Discard** - Remove item
- 📦 **Empty** - No items message

## 🏆 Game Over Screen (`components/game/GameOverScreen.tsx`)

### Results
- 💀 **Death** - Game over
- 🏆 **Victory** - Game won
- 📊 **Stats** - Final statistics

## 🎨 PWA (`components/PWAInstallPrompt.tsx`)

### Install Prompt
- 🎲 **App Icon** - Install prompt icon

## 📱 Offline Page (`public/offline.html`)

### Offline State
- 🎲 **Offline Icon** - You're offline message

---

## 📊 Summary by Category

### Most Used Emojis
1. 🎲 **Dice** - 5+ uses (game theme)
2. 💰 **Coins** - 10+ uses (currency)
3. ⚔️ **Sword** - 8+ uses (combat/attack)
4. 🛡️ **Shield** - 8+ uses (defense)
5. 💀 **Skull** - 6+ uses (death/cursed)

### Categories
- **Combat**: 15+ emojis
- **Items**: 20+ emojis
- **Status Effects**: 6 emojis
- **Tiles**: 12 emojis
- **UI Actions**: 10+ emojis
- **Character Creator**: 10 emojis
- **Destiny**: 5 emojis

### Total Unique Emojis
**70+ different emojis** used throughout the game!

---

## 🎯 Replacement Suggestions

If you want to replace emojis with custom icons:

### High Priority (Most Visible)
1. 🎲 Dice → Custom dice icon
2. 💰 Coins → Custom coin icon
3. ⚔️ Attack → Custom sword icon
4. 🛡️ Defense → Custom shield icon
5. 🏪 Shop → Custom shop icon

### Medium Priority
6. 👹 Enemy → Custom enemy icon
7. 💀 Elite/Boss → Custom skull icon
8. 🧪 Potion → Custom potion icon
9. ✨ Relic → Custom relic icon
10. 📦 Inventory → Custom bag icon

### Low Priority (Less Visible)
- Status effect emojis
- Trap type emojis
- Character creator category emojis
- Debug message emojis

---

**Note**: Emojis are great for rapid development and cross-platform compatibility, but custom SVG icons can provide better branding and consistency!
