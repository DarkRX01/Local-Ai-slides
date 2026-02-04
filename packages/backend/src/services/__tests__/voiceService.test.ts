import { describe, it, expect, beforeEach, vi } from 'vitest';
import { voiceService } from '../voiceService';
import type { VoiceCommandRequest, TTSRequest, VoiceOverRequest } from '@slides-clone/shared';

vi.mock('../../utils/database', () => ({
  db: {
    prepare: vi.fn(() => ({
      get: vi.fn(),
      run: vi.fn(),
    })),
  },
}));

vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
    readFile: vi.fn(),
    unlink: vi.fn(),
    mkdir: vi.fn(),
    stat: vi.fn(() => ({ size: 16000 })),
    readdir: vi.fn(() => []),
  },
}));

describe('VoiceService', () => {
  describe('transcribeAudio', () => {
    it('should transcribe audio from buffer', async () => {
      const request: VoiceCommandRequest = {
        audioData: Buffer.from('test audio data'),
        language: 'en',
      };

      const response = await voiceService.transcribeAudio(request);

      expect(response).toHaveProperty('transcript');
      expect(response).toHaveProperty('language');
      expect(response).toHaveProperty('confidence');
      expect(response).toHaveProperty('duration');
      expect(typeof response.transcript).toBe('string');
      expect(response.language).toBe('en');
    });

    it('should transcribe audio from base64 string', async () => {
      const request: VoiceCommandRequest = {
        audioData: 'data:audio/wav;base64,dGVzdCBhdWRpbyBkYXRh',
        language: 'es',
      };

      const response = await voiceService.transcribeAudio(request);

      expect(response).toHaveProperty('transcript');
      expect(response.language).toBe('es');
    });
  });

  describe('parseVoiceCommand', () => {
    it('should parse navigation commands', () => {
      expect(voiceService.parseVoiceCommand('next slide')).toEqual({
        type: 'navigate',
        target: 'next',
      });

      expect(voiceService.parseVoiceCommand('previous slide')).toEqual({
        type: 'navigate',
        target: 'previous',
      });

      expect(voiceService.parseVoiceCommand('first slide')).toEqual({
        type: 'navigate',
        target: 'first',
      });

      expect(voiceService.parseVoiceCommand('last slide')).toEqual({
        type: 'navigate',
        target: 'last',
      });
    });

    it('should parse slide number navigation', () => {
      const result = voiceService.parseVoiceCommand('go to slide 5');
      expect(result).toEqual({
        type: 'navigate',
        target: 'specific',
        value: 5,
      });
    });

    it('should parse create commands', () => {
      expect(voiceService.parseVoiceCommand('create slide')).toEqual({
        type: 'create',
        target: 'slide',
      });
    });

    it('should parse delete commands', () => {
      expect(voiceService.parseVoiceCommand('delete slide')).toEqual({
        type: 'delete',
        target: 'slide',
      });
    });

    it('should parse export commands', () => {
      expect(voiceService.parseVoiceCommand('export to pdf')).toEqual({
        type: 'export',
        target: 'pdf',
      });

      expect(voiceService.parseVoiceCommand('export to pptx')).toEqual({
        type: 'export',
        target: 'pptx',
      });
    });

    it('should parse theme commands', () => {
      expect(voiceService.parseVoiceCommand('dark mode')).toEqual({
        type: 'theme',
        value: 'dark',
      });

      expect(voiceService.parseVoiceCommand('light mode')).toEqual({
        type: 'theme',
        value: 'light',
      });
    });

    it('should return unknown for unrecognized commands', () => {
      expect(voiceService.parseVoiceCommand('hello world')).toEqual({
        type: 'unknown',
      });
    });
  });

  describe('generateSpeech', () => {
    it('should generate speech with default settings', async () => {
      const request: TTSRequest = {
        text: 'Hello, world!',
      };

      const response = await voiceService.generateSpeech(request);

      expect(response).toHaveProperty('audioData');
      expect(response).toHaveProperty('format');
      expect(response).toHaveProperty('duration');
      expect(response.format).toBe('wav');
    });

    it('should generate speech with custom settings', async () => {
      const request: TTSRequest = {
        text: 'Test text',
        language: 'es',
        voice: 'es',
        speed: 150,
        pitch: 60,
      };

      const response = await voiceService.generateSpeech(request);

      expect(response).toHaveProperty('audioData');
      expect(response.format).toBe('wav');
    });
  });

  describe('getAvailableVoices', () => {
    it('should return list of available voices', async () => {
      const voices = await voiceService.getAvailableVoices();

      expect(Array.isArray(voices)).toBe(true);
      expect(voices.length).toBeGreaterThan(0);
      expect(voices[0]).toHaveProperty('id');
      expect(voices[0]).toHaveProperty('name');
      expect(voices[0]).toHaveProperty('language');
      expect(voices[0]).toHaveProperty('languageCode');
    });

    it('should include multiple languages', async () => {
      const voices = await voiceService.getAvailableVoices();

      const languages = voices.map((v) => v.languageCode);
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('fr');
    });
  });

  describe('cleanup', () => {
    it('should cleanup temporary files without errors', async () => {
      await expect(voiceService.cleanup()).resolves.not.toThrow();
    });
  });
});
