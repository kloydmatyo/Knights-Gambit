import { GameState } from './types';
import { WeaponUpgradeState } from './types';

const SAVE_PREFIX = 'knights_gambit_save_';
const MAX_SLOTS = 3;
const INACTIVITY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SaveData {
  slot: number;
  playerName: string;
  gameState: GameState;
  upgradeState: WeaponUpgradeState;
  savedAt: number;
}

function slotKey(slot: number): string {
  return `${SAVE_PREFIX}${slot}`;
}

export const SaveEngine = {
  /** Save to a specific slot (0–2). */
  save(slot: number, playerName: string, gameState: GameState, upgradeState: WeaponUpgradeState): void {
    if (typeof window === 'undefined') return;
    const data: SaveData = { slot, playerName, gameState, upgradeState, savedAt: Date.now() };
    try {
      localStorage.setItem(slotKey(slot), JSON.stringify(data));
    } catch {
      // localStorage full or unavailable
    }
  },

  /** Load a specific slot. Returns null if empty or expired. */
  loadSlot(slot: number): SaveData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(slotKey(slot));
      if (!raw) return null;
      const data: SaveData = JSON.parse(raw);
      if (Date.now() - data.savedAt > INACTIVITY_MS) {
        SaveEngine.clearSlot(slot);
        return null;
      }
      // Backfill slot field for saves that predate multi-slot
      if (data.slot === undefined) data.slot = slot;
      // Backfill flags for saves that predate the flag system
      if (!data.gameState.flags) data.gameState.flags = {};
      // Backfill new stat upgrade counts for saves that predate armor pen/crit upgrades
      if (!data.gameState.statUpgradeCounts.armorPen) data.gameState.statUpgradeCounts.armorPen = 0;
      if (!data.gameState.statUpgradeCounts.critChance) data.gameState.statUpgradeCounts.critChance = 0;
      if (!data.gameState.statUpgradeCounts.critDamage) data.gameState.statUpgradeCounts.critDamage = 0;
      return data;
    } catch {
      SaveEngine.clearSlot(slot);
      return null;
    }
  },

  /** Load all non-empty slots. */
  loadAll(): SaveData[] {
    const results: SaveData[] = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      const s = SaveEngine.loadSlot(i);
      if (s) results.push(s);
    }
    return results;
  },

  /** Find the first empty slot, or null if all full. */
  findEmptySlot(): number | null {
    for (let i = 0; i < MAX_SLOTS; i++) {
      if (!SaveEngine.loadSlot(i)) return i;
    }
    return null;
  },

  /** Clear a specific slot. */
  clearSlot(slot: number): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(slotKey(slot));
  },

  /** Clear all slots. */
  clearAll(): void {
    for (let i = 0; i < MAX_SLOTS; i++) SaveEngine.clearSlot(i);
    // Also clear legacy single-save key
    if (typeof window !== 'undefined') localStorage.removeItem('knights_gambit_save');
  },

  MAX_SLOTS,
};
