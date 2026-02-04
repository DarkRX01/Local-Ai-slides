import { create } from 'zustand';
import { Presentation, Slide } from '@/types';

interface PresentationState {
  presentations: Presentation[];
  currentPresentation: Presentation | null;
  currentSlideIndex: number;
  loading: boolean;
  error: string | null;

  setCurrentPresentation: (presentation: Presentation | null) => void;
  setCurrentSlideIndex: (index: number) => void;
  addPresentation: (presentation: Presentation) => void;
  updatePresentation: (id: string, updates: Partial<Presentation>) => void;
  deletePresentation: (id: string) => void;
  addSlide: (presentationId: string, slide: Slide) => void;
  updateSlide: (presentationId: string, slideId: string, updates: Partial<Slide>) => void;
  deleteSlide: (presentationId: string, slideId: string) => void;
  reorderSlide: (presentationId: string, fromIndex: number, toIndex: number) => void;
  duplicateSlide: (presentationId: string, slideId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
  presentations: [],
  currentPresentation: null,
  currentSlideIndex: 0,
  loading: false,
  error: null,

  setCurrentPresentation: (presentation) => set({ currentPresentation: presentation, currentSlideIndex: 0 }),

  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),

  addPresentation: (presentation) =>
    set((state) => ({
      presentations: [...state.presentations, presentation],
    })),

  updatePresentation: (id, updates) =>
    set((state) => ({
      presentations: state.presentations.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
      currentPresentation:
        state.currentPresentation?.id === id
          ? { ...state.currentPresentation, ...updates, updatedAt: new Date().toISOString() }
          : state.currentPresentation,
    })),

  deletePresentation: (id) =>
    set((state) => ({
      presentations: state.presentations.filter((p) => p.id !== id),
      currentPresentation: state.currentPresentation?.id === id ? null : state.currentPresentation,
    })),

  addSlide: (presentationId, slide) =>
    set((state) => {
      const presentations = state.presentations.map((p) =>
        p.id === presentationId ? { ...p, slides: [...p.slides, slide] } : p
      );
      const currentPresentation =
        state.currentPresentation?.id === presentationId
          ? { ...state.currentPresentation, slides: [...state.currentPresentation.slides, slide] }
          : state.currentPresentation;
      return { presentations, currentPresentation };
    }),

  updateSlide: (presentationId, slideId, updates) =>
    set((state) => {
      const presentations = state.presentations.map((p) =>
        p.id === presentationId
          ? { ...p, slides: p.slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s)) }
          : p
      );
      const currentPresentation =
        state.currentPresentation?.id === presentationId
          ? {
              ...state.currentPresentation,
              slides: state.currentPresentation.slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s)),
            }
          : state.currentPresentation;
      return { presentations, currentPresentation };
    }),

  deleteSlide: (presentationId, slideId) =>
    set((state) => {
      const presentations = state.presentations.map((p) =>
        p.id === presentationId ? { ...p, slides: p.slides.filter((s) => s.id !== slideId) } : p
      );
      const currentPresentation =
        state.currentPresentation?.id === presentationId
          ? { ...state.currentPresentation, slides: state.currentPresentation.slides.filter((s) => s.id !== slideId) }
          : state.currentPresentation;
      return { presentations, currentPresentation };
    }),

  reorderSlide: (presentationId, fromIndex, toIndex) =>
    set((state) => {
      const updateSlides = (slides: Slide[]) => {
        const newSlides = [...slides];
        const [movedSlide] = newSlides.splice(fromIndex, 1);
        newSlides.splice(toIndex, 0, movedSlide);
        return newSlides.map((slide, index) => ({ ...slide, order: index }));
      };

      const presentations = state.presentations.map((p) =>
        p.id === presentationId ? { ...p, slides: updateSlides(p.slides) } : p
      );
      const currentPresentation =
        state.currentPresentation?.id === presentationId
          ? { ...state.currentPresentation, slides: updateSlides(state.currentPresentation.slides) }
          : state.currentPresentation;
      return { presentations, currentPresentation };
    }),

  duplicateSlide: (presentationId, slideId) =>
    set((state) => {
      const presentation = state.presentations.find((p) => p.id === presentationId);
      if (!presentation) return state;

      const slideIndex = presentation.slides.findIndex((s) => s.id === slideId);
      if (slideIndex === -1) return state;

      const originalSlide = presentation.slides[slideIndex];
      const newSlide: Slide = {
        ...originalSlide,
        id: `slide-${Date.now()}`,
        order: slideIndex + 1,
      };

      const presentations = state.presentations.map((p) =>
        p.id === presentationId
          ? { ...p, slides: [...p.slides.slice(0, slideIndex + 1), newSlide, ...p.slides.slice(slideIndex + 1)] }
          : p
      );

      const currentPresentation =
        state.currentPresentation?.id === presentationId
          ? {
              ...state.currentPresentation,
              slides: [
                ...state.currentPresentation.slides.slice(0, slideIndex + 1),
                newSlide,
                ...state.currentPresentation.slides.slice(slideIndex + 1),
              ],
            }
          : state.currentPresentation;

      return { presentations, currentPresentation };
    }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
