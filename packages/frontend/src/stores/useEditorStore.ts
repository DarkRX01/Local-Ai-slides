import { create } from 'zustand';
import { SlideElement } from '@shared/types';

interface EditorState {
  selectedElementIds: string[];
  clipboard: SlideElement[];
  history: HistoryEntry[];
  historyIndex: number;
  zoom: number;
  gridEnabled: boolean;
  snapEnabled: boolean;

  setSelectedElements: (ids: string[]) => void;
  addSelectedElement: (id: string) => void;
  removeSelectedElement: (id: string) => void;
  clearSelection: () => void;
  copyElements: (elements: SlideElement[]) => void;
  undo: () => void;
  redo: () => void;
  addHistoryEntry: (entry: HistoryEntry) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
}

interface HistoryEntry {
  action: string;
  data: unknown;
  timestamp: number;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  selectedElementIds: [],
  clipboard: [],
  history: [],
  historyIndex: -1,
  zoom: 1,
  gridEnabled: true,
  snapEnabled: true,

  setSelectedElements: (ids) => set({ selectedElementIds: ids }),

  addSelectedElement: (id) =>
    set((state) => ({
      selectedElementIds: [...state.selectedElementIds, id],
    })),

  removeSelectedElement: (id) =>
    set((state) => ({
      selectedElementIds: state.selectedElementIds.filter((eid) => eid !== id),
    })),

  clearSelection: () => set({ selectedElementIds: [] }),

  copyElements: (elements) => set({ clipboard: elements }),

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex > 0) {
      set({ historyIndex: historyIndex - 1 });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      set({ historyIndex: historyIndex + 1 });
    }
  },

  addHistoryEntry: (entry) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(entry);
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
}));
