import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useVoiceStore } from '../voiceStore';
import { api } from '@/services/api';

vi.mock('@/services/api', () => ({
  api: {
    getAvailableVoices: vi.fn(),
    transcribeAudio: vi.fn(),
    parseVoiceCommand: vi.fn(),
    generateSpeech: vi.fn(),
    generateVoiceOver: vi.fn(),
    getVoiceOver: vi.fn(),
    deleteVoiceOver: vi.fn(),
  },
}));

describe('VoiceStore', () => {
  beforeEach(() => {
    useVoiceStore.setState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      currentTranscript: '',
      lastCommand: null,
      availableVoices: [],
      error: null,
      voiceOversCache: new Map(),
      settings: {
        enabled: true,
        language: 'en',
        voice: 'en-us',
        speed: 1.0,
        pitch: 1.0,
        autoGenerateVoiceOvers: false,
      },
    });
    vi.clearAllMocks();
  });

  describe('settings management', () => {
    it('should update settings', () => {
      const { updateSettings } = useVoiceStore.getState();

      updateSettings({ enabled: false });
      expect(useVoiceStore.getState().settings.enabled).toBe(false);

      updateSettings({ language: 'es' });
      expect(useVoiceStore.getState().settings.language).toBe('es');

      updateSettings({ speed: 1.5, pitch: 1.2 });
      expect(useVoiceStore.getState().settings.speed).toBe(1.5);
      expect(useVoiceStore.getState().settings.pitch).toBe(1.2);
    });
  });

  describe('loadAvailableVoices', () => {
    it('should load available voices successfully', async () => {
      const mockVoices = [
        { id: 'en-us', name: 'English (US)', language: 'English', languageCode: 'en' },
        { id: 'es', name: 'Spanish', language: 'Spanish', languageCode: 'es' },
      ];

      vi.mocked(api.getAvailableVoices).mockResolvedValue(mockVoices);

      const { loadAvailableVoices } = useVoiceStore.getState();
      await loadAvailableVoices();

      expect(useVoiceStore.getState().availableVoices).toEqual(mockVoices);
    });

    it('should handle errors when loading voices', async () => {
      vi.mocked(api.getAvailableVoices).mockRejectedValue(new Error('Network error'));

      const { loadAvailableVoices } = useVoiceStore.getState();
      await loadAvailableVoices();

      expect(useVoiceStore.getState().error).toBe('Failed to load available voices');
    });
  });

  describe('transcribeAudio', () => {
    it('should transcribe audio blob', async () => {
      const mockResponse = {
        transcript: 'hello world',
        language: 'en',
        confidence: 0.95,
        duration: 1000,
      };

      vi.mocked(api.transcribeAudio).mockResolvedValue(mockResponse);

      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
      const { transcribeAudio } = useVoiceStore.getState();

      const result = await transcribeAudio(audioBlob);

      expect(result.transcript).toBe('hello world');
      expect(useVoiceStore.getState().currentTranscript).toBe('hello world');
      expect(useVoiceStore.getState().isProcessing).toBe(false);
    });

    it('should handle transcription errors', async () => {
      vi.mocked(api.transcribeAudio).mockRejectedValue(new Error('Transcription failed'));

      const audioBlob = new Blob(['audio data'], { type: 'audio/wav' });
      const { transcribeAudio } = useVoiceStore.getState();

      await expect(transcribeAudio(audioBlob)).rejects.toThrow('Transcription failed');
      expect(useVoiceStore.getState().error).toBe('Failed to transcribe audio');
    });
  });

  describe('parseCommand', () => {
    it('should parse voice command', async () => {
      const mockAction = {
        type: 'navigate',
        target: 'next',
      };

      vi.mocked(api.parseVoiceCommand).mockResolvedValue({
        transcript: 'next slide',
        action: mockAction,
        timestamp: new Date().toISOString(),
      });

      const { parseCommand } = useVoiceStore.getState();
      const result = await parseCommand('next slide');

      expect(result).toEqual(mockAction);
      expect(useVoiceStore.getState().lastCommand).toEqual(mockAction);
    });
  });

  describe('generateSpeech', () => {
    it('should generate speech', async () => {
      const mockResponse = {
        audioData: 'base64audiodata',
        format: 'wav' as const,
        duration: 2,
      };

      vi.mocked(api.generateSpeech).mockResolvedValue(mockResponse);

      const { generateSpeech } = useVoiceStore.getState();
      const result = await generateSpeech('Hello world');

      expect(result).toEqual(mockResponse);
      expect(useVoiceStore.getState().isProcessing).toBe(false);
    });

    it('should use custom options', async () => {
      const mockResponse = {
        audioData: 'base64audiodata',
        format: 'wav' as const,
        duration: 2,
      };

      vi.mocked(api.generateSpeech).mockResolvedValue(mockResponse);

      const { generateSpeech } = useVoiceStore.getState();
      await generateSpeech('Test', {
        language: 'es',
        voice: 'es',
        speed: 1.5,
        pitch: 1.2,
      });

      expect(api.generateSpeech).toHaveBeenCalledWith({
        text: 'Test',
        language: 'es',
        voice: 'es',
        speed: 1.5,
        pitch: 1.2,
      });
    });
  });

  describe('generateVoiceOver', () => {
    it('should generate voice-over for slide', async () => {
      const mockResponse = {
        slideId: 'slide-1',
        audioUrl: '/api/voice/voiceovers/file.wav',
        duration: 5,
      };

      vi.mocked(api.generateVoiceOver).mockResolvedValue(mockResponse);

      const { generateVoiceOver } = useVoiceStore.getState();
      const result = await generateVoiceOver('slide-1');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('voice-over cache management', () => {
    it('should cache voice-over data', async () => {
      const mockVoiceOver = {
        id: 'vo-1',
        slideId: 'slide-1',
        audioPath: '/path/to/audio.wav',
        duration: 5,
        language: 'en',
        createdAt: new Date().toISOString(),
      };

      vi.mocked(api.getVoiceOver).mockResolvedValue(mockVoiceOver);

      const { getVoiceOver } = useVoiceStore.getState();
      const result = await getVoiceOver('slide-1');

      expect(result).toEqual(mockVoiceOver);
      expect(useVoiceStore.getState().voiceOversCache.has('slide-1')).toBe(true);
    });

    it('should return cached voice-over on subsequent calls', async () => {
      const mockVoiceOver = {
        id: 'vo-1',
        slideId: 'slide-1',
        audioPath: '/path/to/audio.wav',
        duration: 5,
        language: 'en',
        createdAt: new Date().toISOString(),
      };

      useVoiceStore.setState({
        voiceOversCache: new Map([['slide-1', mockVoiceOver]]),
      });

      const { getVoiceOver } = useVoiceStore.getState();
      const result = await getVoiceOver('slide-1');

      expect(result).toEqual(mockVoiceOver);
      expect(api.getVoiceOver).not.toHaveBeenCalled();
    });

    it('should remove from cache on delete', async () => {
      const mockVoiceOver = {
        id: 'vo-1',
        slideId: 'slide-1',
        audioPath: '/path/to/audio.wav',
        duration: 5,
        language: 'en',
        createdAt: new Date().toISOString(),
      };

      useVoiceStore.setState({
        voiceOversCache: new Map([['slide-1', mockVoiceOver]]),
      });

      vi.mocked(api.deleteVoiceOver).mockResolvedValue();

      const { deleteVoiceOver } = useVoiceStore.getState();
      await deleteVoiceOver('slide-1');

      expect(useVoiceStore.getState().voiceOversCache.has('slide-1')).toBe(false);
    });
  });

  describe('listening controls', () => {
    it('should start listening when enabled', () => {
      const { startListening } = useVoiceStore.getState();
      startListening();

      expect(useVoiceStore.getState().isListening).toBe(true);
      expect(useVoiceStore.getState().currentTranscript).toBe('');
    });

    it('should not start listening when disabled', () => {
      useVoiceStore.setState({
        settings: { ...useVoiceStore.getState().settings, enabled: false },
      });

      const { startListening } = useVoiceStore.getState();
      startListening();

      expect(useVoiceStore.getState().isListening).toBe(false);
      expect(useVoiceStore.getState().error).toBe('Voice commands are not enabled');
    });

    it('should stop listening', () => {
      useVoiceStore.setState({ isListening: true });

      const { stopListening } = useVoiceStore.getState();
      stopListening();

      expect(useVoiceStore.getState().isListening).toBe(false);
    });
  });
});
