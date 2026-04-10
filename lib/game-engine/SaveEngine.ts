import { GameState } from './types';
import { WeaponUpgradeState } from './types';

const SAVE_KEY = 'knights_gambit_save';
const INACTIVITY_MS = 12 * 60 * 1000; // 12 minutes

export interface SaveData {
  playerName: string;
  gameState: GameState;
  upgradeState: WeaponUpgradeState;
  savedAt: number; // timestamp
}

export const SaveEngine = {
  save(playerName: string, gameState: GameState, upgradeState: WeaponUpgradeState): void {
    if (typeof window === 'undefined') return;
    const data: SaveData = { playerName, gameState, upgradeState, savedAt: Date.now() };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // localStorage full or unavailable — silently ignore
    }
  },

  load(): SaveData | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data: SaveData = JSON.parse(raw);
      // Auto-expire after inactivity window
      if (Date.now() - data.savedAt > INACTIVITY_MS) {
        SaveEngine.clear();
        return null;
      }
      return data;
    } catch {
      SaveEngine.clear();
      return null;
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SAVE_KEY);
  },

  exists(): boolean {
    return SaveEngine.load() !== null;
  },
};
