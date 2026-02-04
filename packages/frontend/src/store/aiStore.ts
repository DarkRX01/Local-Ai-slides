import { create } from 'zustand';
import { api } from '@/services/api';

interface AIStore {
  isGenerating: boolean;
  streamingText: string;
  availableModels: string[];
  selectedModel: string;
  temperature: number;
  error: string | null;
  aiStatus: 'idle' | 'checking' | 'available' | 'unavailable';

  setIsGenerating: (value: boolean) => void;
  setStreamingText: (text: string) => void;
  appendStreamingText: (chunk: string) => void;
  clearStreamingText: () => void;
  setSelectedModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setError: (error: string | null) => void;
  checkAIHealth: () => Promise<void>;
  loadModels: () => Promise<void>;
  generatePresentation: (request: {
    prompt: string;
    slideCount: number;
    language?: string;
    theme?: string;
    includeImages?: boolean;
    animationLevel?: 'none' | 'basic' | 'advanced';
  }) => Promise<{
    presentationId: string;
    slides: unknown[];
    status: 'success' | 'partial' | 'failed';
    error?: string;
  }>;
  enhanceSlide: (slideId: string, type: 'content' | 'layout' | 'animations', context?: string) => Promise<unknown>;
  suggestAnimations: (slideId: string, context?: string) => Promise<unknown>;
  streamGenerate: (prompt: string, onChunk: (chunk: string) => void) => Promise<void>;
}

export const useAIStore = create<AIStore>((set, get) => ({
  isGenerating: false,
  streamingText: '',
  availableModels: [],
  selectedModel: 'llama3',
  temperature: 0.7,
  error: null,
  aiStatus: 'idle',

  setIsGenerating: (value) => set({ isGenerating: value }),

  setStreamingText: (text) => set({ streamingText: text }),

  appendStreamingText: (chunk) => set((state) => ({ streamingText: state.streamingText + chunk })),

  clearStreamingText: () => set({ streamingText: '' }),

  setSelectedModel: (model) => set({ selectedModel: model }),

  setTemperature: (temp) => set({ temperature: temp }),

  setError: (error) => set({ error }),

  checkAIHealth: async () => {
    set({ aiStatus: 'checking', error: null });
    try {
      const result = await api.checkAIHealth();
      set({ aiStatus: result.status === 'ok' ? 'available' : 'unavailable' });
    } catch (error) {
      set({ aiStatus: 'unavailable', error: 'Failed to connect to AI service' });
    }
  },

  loadModels: async () => {
    try {
      const result = await api.listAIModels();
      set({ availableModels: result.models });
      if (result.models.length > 0 && !result.models.includes(get().selectedModel)) {
        set({ selectedModel: result.models[0] });
      }
    } catch (error) {
      console.error('Failed to load AI models:', error);
      set({ error: 'Failed to load available models' });
    }
  },

  generatePresentation: async (request) => {
    const { selectedModel, temperature } = get();
    set({ isGenerating: true, error: null });

    try {
      const result = await api.generatePresentation({
        ...request,
        options: {
          model: selectedModel,
          temperature,
        },
      });

      set({ isGenerating: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate presentation';
      set({ isGenerating: false, error: errorMessage });
      throw error;
    }
  },

  enhanceSlide: async (slideId, type, context) => {
    set({ isGenerating: true, error: null });

    try {
      const result = await api.enhanceSlide(slideId, type, context);
      set({ isGenerating: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance slide';
      set({ isGenerating: false, error: errorMessage });
      throw error;
    }
  },

  suggestAnimations: async (slideId, context) => {
    set({ isGenerating: true, error: null });

    try {
      const result = await api.suggestAnimations(slideId, context);
      set({ isGenerating: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to suggest animations';
      set({ isGenerating: false, error: errorMessage });
      throw error;
    }
  },

  streamGenerate: async (prompt, onChunk) => {
    const { selectedModel, temperature } = get();
    set({ isGenerating: true, error: null, streamingText: '' });

    try {
      await api.streamGenerate(prompt, selectedModel, temperature, (chunk) => {
        get().appendStreamingText(chunk);
        onChunk(chunk);
      });
      set({ isGenerating: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate text';
      set({ isGenerating: false, error: errorMessage });
      throw error;
    }
  },
}));
