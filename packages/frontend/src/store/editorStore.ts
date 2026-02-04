import { create } from 'zustand';
import { SlideElement } from '@/types';

interface HistoryEntry {
  slideId: string;
  elements: SlideElement[];
}

interface EditorState {
  selectedElementIds: string[];
  clipboard: SlideElement[];
  history: HistoryEntry[];
  historyIndex: number;
  zoom: number;
  pan: { x: number; y: number };
  tool: 'select' | 'text' | 'image' | 'shape' | 'draw';
  showGrid: boolean;
  showGuides: boolean;
  snapToGrid: boolean;

  setSelectedElements: (ids: string[]) => void;
  addSelectedElement: (id: string) => void;
  removeSelectedElement: (id: string) => void;
  clearSelection: () => void;
  copy: (elements: SlideElement[]) => void;
  paste: () => SlideElement[];
  addToHistory: (slideId: string, elements: SlideElement[]) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setTool: (tool: EditorState['tool']) => void;
  toggleGrid: () => void;
  toggleGuides: () => void;
  toggleSnapToGrid: () => void;
  reset: () => void;
}

const initialState = {
  selectedElementIds: [],
  clipboard: [],
  history: [],
  historyIndex: -1,
  zoom: 1,
  pan: { x: 0, y: 0 },
  tool: 'select' as const,
  showGrid: true,
  showGuides: true,
  snapToGrid: true,
};

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,

  setSelectedElements: (ids) => set({ selectedElementIds: ids }),

  addSelectedElement: (id) =>
    set((state) => ({
      selectedElementIds: state.selectedElementIds.includes(id)
        ? state.selectedElementIds
        : [...state.selectedElementIds, id],
    })),

  removeSelectedElement: (id) =>
    set((state) => ({
      selectedElementIds: state.selectedElementIds.filter((selectedId) => selectedId !== id),
    })),

  clearSelection: () => set({ selectedElementIds: [] }),

  copy: (elements) => set({ clipboard: elements.map((el) => ({ ...el })) }),

  paste: () => {
    const { clipboard } = get();
    return clipboard.map((el) => ({
      ...el,
      id: `element-${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
    }));
  },

  addToHistory: (slideId, elements) =>
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ slideId, elements: elements.map((el) => ({ ...el })) });
      if (newHistory.length > 50) {
        newHistory.shift();
        return { history: newHistory, historyIndex: 49 };
      }
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return null;
    const newIndex = historyIndex - 1;
    set({ historyIndex: newIndex });
    return history[newIndex];
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return null;
    const newIndex = historyIndex + 1;
    set({ historyIndex: newIndex });
    return history[newIndex];
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),

  setPan: (pan) => set({ pan }),

  setTool: (tool) => set({ tool }),

  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  reset: () => set(initialState),
}));
