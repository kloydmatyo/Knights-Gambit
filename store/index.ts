import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameState, UIState } from './types';
import { WeaponUpgradeState } from '@/lib/game-engine/types';
import { WeaponUpgradeEngine } from '@/lib/game-engine/WeaponUpgradeEngine';

interface Store {
  // Game State
  game: GameState;
  
  // UI State
  ui: UIState;

  // Weapon Upgrade State
  weaponUpgrades: WeaponUpgradeState;
  
  // Game Actions
  initializeGame: (characterClass: string) => void;
  updatePlayerHealth: (health: number) => void;
  updatePlayerPosition: (position: number) => void;
  addToInventory: (item: any) => void;
  removeFromInventory: (itemId: string) => void;
  purchaseWeaponUpgrade: (upgradeId: string) => { success: boolean; message: string };
  
  // UI Actions
  openModal: (modalType: string) => void;
  closeModal: () => void;
  setLoading: (loading: boolean) => void;
  toggleInventory: () => void;
}

export const useStore = create<Store>()(
  devtools(
    persist(
      (set) => ({
        // Initial Game State
        game: {
          player: null,
          currentFloor: 1,
          currentPosition: 0,
          board: [],
          enemies: [],
          isInCombat: false,
          turnCount: 0,
        },
        
        // Initial UI State
        ui: {
          activeModal: null,
          isLoading: false,
          isInventoryOpen: false,
          isMobileMenuOpen: false,
          notifications: [],
        },

        // Initial Weapon Upgrade State
        weaponUpgrades: WeaponUpgradeEngine.createInitialState(),
        
        // Game Actions
        initializeGame: (characterClass) =>
          set((state) => ({
            game: {
              ...state.game,
              player: {
                class: characterClass,
                health: 100,
                maxHealth: 100,
                attack: 10,
                defense: 5,
                coins: 50,
                position: 0,
                inventory: [],
                skills: [],
                statusEffects: [],
              },
            },
            weaponUpgrades: WeaponUpgradeEngine.createInitialState(),
          })),
        
        updatePlayerHealth: (health) =>
          set((state) => ({
            game: {
              ...state.game,
              player: state.game.player
                ? { ...state.game.player, health }
                : null,
            },
          })),
        
        updatePlayerPosition: (position) =>
          set((state) => ({
            game: {
              ...state.game,
              currentPosition: position,
              player: state.game.player
                ? { ...state.game.player, position }
                : null,
            },
          })),
        
        addToInventory: (item) =>
          set((state) => ({
            game: {
              ...state.game,
              player: state.game.player
                ? {
                    ...state.game.player,
                    inventory: [...state.game.player.inventory, item],
                  }
                : null,
            },
          })),
        
        removeFromInventory: (itemId) =>
          set((state) => ({
            game: {
              ...state.game,
              player: state.game.player
                ? {
                    ...state.game.player,
                    inventory: state.game.player.inventory.filter(
                      (item) => item.id !== itemId
                    ),
                  }
                : null,
            },
          })),

        purchaseWeaponUpgrade: (upgradeId) => {
          let result = { success: false, message: 'No player found.' };
          set((state) => {
            if (!state.game.player) return state;
            const player = state.game.player;
            const outcome = WeaponUpgradeEngine.purchaseUpgrade(
              player.class,
              player.coins,
              upgradeId,
              state.game.currentFloor,
              state.weaponUpgrades
            );
            if (!outcome) {
              result = { success: false, message: 'Cannot purchase this upgrade.' };
              return state;
            }
            result = { success: true, message: outcome.message };
            return {
              game: {
                ...state.game,
                player: {
                  ...player,
                  coins: outcome.coins,
                  attack: player.attack + outcome.attackDelta,
                  defense: player.defense + outcome.defenseDelta,
                  maxHealth: player.maxHealth + outcome.healthDelta,
                  health: Math.min(player.health + outcome.healthDelta, player.maxHealth + outcome.healthDelta),
                },
              },
              weaponUpgrades: outcome.upgradeState,
            };
          });
          return result;
        },
        
        // UI Actions
        openModal: (modalType) =>
          set((state) => ({
            ui: { ...state.ui, activeModal: modalType },
          })),
        
        closeModal: () =>
          set((state) => ({
            ui: { ...state.ui, activeModal: null },
          })),
        
        setLoading: (loading) =>
          set((state) => ({
            ui: { ...state.ui, isLoading: loading },
          })),
        
        toggleInventory: () =>
          set((state) => ({
            ui: { ...state.ui, isInventoryOpen: !state.ui.isInventoryOpen },
          })),
      }),
      {
        name: 'knights-gambit-storage',
        partialize: (state) => ({ game: state.game, weaponUpgrades: state.weaponUpgrades }),
      }
    )
  )
);
