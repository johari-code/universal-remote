import { create } from "zustand";

export interface RemoteButton {
  id: string;
  type: string;
  label?: string;
  icon?: string;
  color?: string;
  position: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
}

interface RemoteStore {
  buttons: RemoteButton[];
  selectedButton: string | null;
  addButton: (button: RemoteButton) => void;
  removeButton: (id: string) => void;
  updateButton: (id: string, updates: Partial<RemoteButton>) => void;
  moveButton: (id: string, newPosition: RemoteButton["position"]) => void;
  setSelectedButton: (id: string | null) => void;
  clearAll: () => void;
}

export const useRemoteStore = create<RemoteStore>((set) => ({
  buttons: [],
  selectedButton: null,

  addButton: (button) =>
    set((state) => ({
      buttons: [...state.buttons, button],
    })),

  removeButton: (id) =>
    set((state) => ({
      buttons: state.buttons.filter((b) => b.id !== id),
      selectedButton: state.selectedButton === id ? null : state.selectedButton,
    })),

  updateButton: (id, updates) =>
    set((state) => ({
      buttons: state.buttons.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    })),

  moveButton: (id, newPosition) =>
    set((state) => ({
      buttons: state.buttons.map((b) =>
        b.id === id ? { ...b, position: newPosition } : b,
      ),
    })),

  setSelectedButton: (id) => set({ selectedButton: id }),

  clearAll: () => set({ buttons: [], selectedButton: null }),
}));
