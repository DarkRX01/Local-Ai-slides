import { create } from 'zustand';
import type {
  VoiceCommandResponse,
  VoiceCommandAction,
  TTSResponse,
  VoiceOverResponse,
  AvailableVoice,
  VoiceSettings,
  SlideVoiceOver,
} from '@slides-clone/shared';
import { api } from '@/services/api';

interface VoiceStore {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  lastCommand: VoiceCommandAction | null;
  availableVoices: AvailableVoice[];
  settings: VoiceSettings;
  error: string | null;
  voiceOversCache: Map<string, SlideVoiceOver>;

  setIsListening: (value: boolean) => void;
  setIsProcessing: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  setCurrentTranscript: (transcript: string) => void;
  setLastCommand: (command: VoiceCommandAction | null) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<VoiceSettings>) => void;

  loadAvailableVoices: () => Promise<void>;
  transcribeAudio: (audioData: Blob | string, language?: string) => Promise<VoiceCommandResponse>;
  parseCommand: (transcript: string) => Promise<VoiceCommandAction>;
  generateSpeech: (text: string, options?: {
    language?: string;
    voice?: string;
    speed?: number;
    pitch?: number;
  }) => Promise<TTSResponse>;
  generateVoiceOver: (slideId: string, options?: {
    text?: string;
    language?: string;
    voice?: string;
  }) => Promise<VoiceOverResponse>;
  getVoiceOver: (slideId: string) => Promise<SlideVoiceOver | null>;
  deleteVoiceOver: (slideId: string) => Promise<void>;
  playVoiceOver: (slideId: string) => Promise<void>;
  stopSpeaking: () => void;
  
  startListening: () => void;
  stopListening: () => void;
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  isListening: false,
  isProcessing: false,
  isSpeaking: false,
  currentTranscript: '',
  lastCommand: null,
  availableVoices: [],
  settings: {
    enabled: false,
    language: 'en',
    voice: 'en-us',
    speed: 1.0,
    pitch: 1.0,
    autoGenerateVoiceOvers: false,
  },
  error: null,
  voiceOversCache: new Map(),

  setIsListening: (value) => set({ isListening: value }),

  setIsProcessing: (value) => set({ isProcessing: value }),

  setIsSpeaking: (value) => set({ isSpeaking: value }),

  setCurrentTranscript: (transcript) => set({ currentTranscript: transcript }),

  setLastCommand: (command) => set({ lastCommand: command }),

  setError: (error) => set({ error }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),

  loadAvailableVoices: async () => {
    try {
      const voices = await api.getAvailableVoices();
      set({ availableVoices: voices });
    } catch (error) {
      console.error('Failed to load available voices:', error);
      set({ error: 'Failed to load available voices' });
    }
  },

  transcribeAudio: async (audioData, language) => {
    set({ isProcessing: true, error: null });

    try {
      let dataToSend: string | Blob = audioData;

      if (audioData instanceof Blob) {
        dataToSend = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(audioData);
        });
      }

      const response = await api.transcribeAudio(dataToSend, language || get().settings.language);
      
      set({ 
        isProcessing: false, 
        currentTranscript: response.transcript 
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio';
      set({ isProcessing: false, error: errorMessage });
      throw error;
    }
  },

  parseCommand: async (transcript) => {
    set({ isProcessing: true, error: null });

    try {
      const response = await api.parseVoiceCommand(transcript);
      set({ 
        isProcessing: false, 
        lastCommand: response.action 
      });

      return response.action;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse command';
      set({ isProcessing: false, error: errorMessage });
      throw error;
    }
  },

  generateSpeech: async (text, options = {}) => {
    set({ isProcessing: true, error: null });

    try {
      const { settings } = get();
      const response = await api.generateSpeech({
        text,
        language: options.language || settings.language,
        voice: options.voice || settings.voice,
        speed: options.speed || settings.speed,
        pitch: options.pitch || settings.pitch,
      });

      set({ isProcessing: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate speech';
      set({ isProcessing: false, error: errorMessage });
      throw error;
    }
  },

  generateVoiceOver: async (slideId, options = {}) => {
    set({ isProcessing: true, error: null });

    try {
      const { settings } = get();
      const response = await api.generateVoiceOver({
        slideId,
        text: options.text,
        language: options.language || settings.language,
        voice: options.voice || settings.voice,
      });

      set({ isProcessing: false });
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate voice-over';
      set({ isProcessing: false, error: errorMessage });
      throw error;
    }
  },

  getVoiceOver: async (slideId) => {
    const cached = get().voiceOversCache.get(slideId);
    if (cached) {
      return cached;
    }

    try {
      const voiceOver = await api.getVoiceOver(slideId);
      
      if (voiceOver) {
        set((state) => {
          const newCache = new Map(state.voiceOversCache);
          newCache.set(slideId, voiceOver);
          return { voiceOversCache: newCache };
        });
      }

      return voiceOver;
    } catch (error) {
      console.error('Failed to get voice-over:', error);
      return null;
    }
  },

  deleteVoiceOver: async (slideId) => {
    try {
      await api.deleteVoiceOver(slideId);
      
      set((state) => {
        const newCache = new Map(state.voiceOversCache);
        newCache.delete(slideId);
        return { voiceOversCache: newCache };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete voice-over';
      set({ error: errorMessage });
      throw error;
    }
  },

  playVoiceOver: async (slideId) => {
    try {
      const voiceOver = await get().getVoiceOver(slideId);
      
      if (!voiceOver) {
        throw new Error('Voice-over not found');
      }

      const audio = new Audio(voiceOver.audioPath);
      
      set({ isSpeaking: true });

      audio.onended = () => {
        set({ isSpeaking: false });
      };

      audio.onerror = () => {
        set({ isSpeaking: false, error: 'Failed to play voice-over' });
      };

      await audio.play();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to play voice-over';
      set({ error: errorMessage, isSpeaking: false });
      throw error;
    }
  },

  stopSpeaking: () => {
    set({ isSpeaking: false });
  },

  startListening: () => {
    if (!get().settings.enabled) {
      set({ error: 'Voice commands are not enabled' });
      return;
    }

    set({ isListening: true, currentTranscript: '', error: null });
  },

  stopListening: () => {
    set({ isListening: false });
  },
}));
