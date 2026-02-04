import { create } from 'zustand';
import { Presentation, Slide } from '@shared/types';

interface PresentationState {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  currentSlideId: string | null;
  
  setCurrentPresentation: (presentation: Presentation | null) => void;
  setCurrentSlideId: (slideId: string | null) => void;
  addPresentation: (presentation: Presentation) => void;
  updatePresentation: (id: string, updates: Partial<Presentation>) => void;
  deletePresentation: (id: string) => void;
  addSlide: (slide: Slide) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  deleteSlide: (slideId: string) => void;
  reorderSlides: (slideIds: string[]) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
  presentations: [],
  currentPresentation: null,
  currentSlideId: null,

  setCurrentPresentation: (presentation) => set({ currentPresentation: presentation }),
  
  setCurrentSlideId: (slideId) => set({ currentSlideId: slideId }),

  addPresentation: (presentation) =>
    set((state) => ({
      presentations: [...state.presentations, presentation],
    })),

  updatePresentation: (id, updates) =>
    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentPresentation:
        state.currentPresentation?.id === id
          ? { ...state.currentPresentation, ...updates }
          : state.currentPresentation,
    })),

  deletePresentation: (id) =>
    set((state) => ({
      presentations: state.presentations.filter((p) => p.id !== id),
      currentPresentation:
        state.currentPresentation?.id === id ? null : state.currentPresentation,
    })),

  addSlide: (slide) =>
    set((state) => {
      if (!state.currentPresentation) return state;
      const updatedSlides = [...state.currentPresentation.slides, slide];
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides: updatedSlides,
        },
      };
    }),

  updateSlide: (slideId, updates) =>
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides: state.currentPresentation.slides.map((s) =>
            s.id === slideId ? { ...s, ...updates } : s
          ),
        },
      };
    }),

  deleteSlide: (slideId) =>
    set((state) => {
      if (!state.currentPresentation) return state;
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides: state.currentPresentation.slides.filter((s) => s.id !== slideId),
        },
        currentSlideId: state.currentSlideId === slideId ? null : state.currentSlideId,
      };
    }),

  reorderSlides: (slideIds) =>
    set((state) => {
      if (!state.currentPresentation) return state;
      const slideMap = new Map(state.currentPresentation.slides.map((s) => [s.id, s]));
      const reorderedSlides = slideIds
        .map((id) => slideMap.get(id))
        .filter((s): s is Slide => s !== undefined)
        .map((s, index) => ({ ...s, order: index }));
      
      return {
        currentPresentation: {
          ...state.currentPresentation,
          slides: reorderedSlides,
        },
      };
    }),
}));
