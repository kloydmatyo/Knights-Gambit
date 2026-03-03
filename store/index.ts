import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameState, UIState } from './types';

interface Store {
  // Game State
  game: GameState;
  
  // UI State
  ui: UIState;
  
  // Game Actions
  initializeGame: (characterClass: string) => void;
  updatePlayerHealth: (health: number) => void;
  updatePlayerPosition: (position: number) => void;
  addToInventory: (item: any) => void;
  removeFromInventory: (itemId: string) => void;
  
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
        partialize: (state) => ({ game: state.game }), // Only persist game state
      }
    )
  )
);
