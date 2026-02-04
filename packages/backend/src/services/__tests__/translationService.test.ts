import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslationService } from '../translationService';

global.fetch = vi.fn() as unknown as typeof fetch;

describe('TranslationService', () => {
  let translationService: TranslationService;

  beforeEach(() => {
    translationService = new TranslationService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAvailableLanguages', () => {
    it('should return list of available languages from LibreTranslate', async () => {
      const mockLanguages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLanguages,
      });

      const languages = await translationService.getAvailableLanguages();

      expect(languages).toEqual(mockLanguages);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/languages');
    });

    it('should return fallback languages when LibreTranslate is unavailable', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Connection failed'));

      const languages = await translationService.getAvailableLanguages();

      expect(languages.length).toBeGreaterThan(0);
      expect(languages[0]).toHaveProperty('code');
      expect(languages[0]).toHaveProperty('name');
    });
  });

  describe('detectLanguage', () => {
    it('should detect language of given text', async () => {
      const mockDetection = [{ language: 'es', confidence: 0.95 }];

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockDetection as typeof mockDetection });

      const result = await translationService.detectLanguage('Hola mundo');

      expect(result.language).toBe('es');
      expect(result.confidence).toBe(0.95);
    });

    it('should return cached detection for same text', async () => {
      const mockDetection = [{ language: 'fr', confidence: 0.9 }];

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockDetection as typeof mockDetection });

      await translationService.detectLanguage('Bonjour');
      await translationService.detectLanguage('Bonjour');

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return default language when LibreTranslate is unavailable', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Connection failed'));

      const result = await translationService.detectLanguage('Hello world');

      expect(result.language).toBe('en');
      expect(result.confidence).toBe(0);
    });
  });

  describe('translate', () => {
    it('should translate text to target language', async () => {
      const mockTranslation = { translatedText: 'Hola mundo' };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslation as typeof mockTranslation });

      const result = await translationService.translate('Hello world', 'es', 'en');

      expect(result).toBe('Hola mundo');
    });

    it('should return original text if source and target languages are the same', async () => {
      const text = 'Hello world';
      const result = await translationService.translate(text, 'en', 'en');

      expect(result).toBe(text);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should return empty string for empty input', async () => {
      const result = await translationService.translate('', 'es', 'en');

      expect(result).toBe('');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should auto-detect source language when not provided', async () => {
      const mockDetection = [{ language: 'en', confidence: 0.95 }];
      const mockTranslation = { translatedText: 'Hola mundo' };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockDetection })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslation as typeof mockTranslation });

      const result = await translationService.translate('Hello world', 'es');

      expect(result).toBe('Hola mundo');
    });

    it('should cache translation results', async () => {
      const mockTranslation = { translatedText: 'Bonjour le monde' };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslation as typeof mockTranslation });

      await translationService.translate('Hello world', 'fr', 'en');
      
      const cachedResult = await translationService.translate('Hello world', 'fr', 'en');

      expect(cachedResult).toBe('Bonjour le monde');
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should throw error when LibreTranslate is unavailable', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Connection failed'));

      await expect(
        translationService.translate('Hello world', 'es', 'en')
      ).rejects.toThrow('LibreTranslate service is not available');
    });
  });

  describe('translateBatch', () => {
    it('should translate multiple texts', async () => {
      const texts = ['Hello', 'World', 'Test'];
      const mockTranslations = [
        { translatedText: 'Hola' },
        { translatedText: 'Mundo' },
        { translatedText: 'Prueba' },
      ];

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslations[0] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslations[1] })
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslations[2] });

      const results = await translationService.translateBatch(texts, 'es', 'en');

      expect(results).toEqual(['Hola', 'Mundo', 'Prueba']);
    });

    it('should handle empty array', async () => {
      const results = await translationService.translateBatch([], 'es', 'en');

      expect(results).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('clearCache', () => {
    it('should clear all cached translations', async () => {
      const mockTranslation = { translatedText: 'Hola' };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslation as typeof mockTranslation });

      await translationService.translate('Hello', 'es', 'en');
      await translationService.clearCache();

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: async () => [] as unknown[] })
        .mockResolvedValueOnce({ ok: true, json: async () => mockTranslation as typeof mockTranslation });

      await translationService.translate('Hello', 'es', 'en');

      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('clearExpiredCache', () => {
    it('should clear only expired cache entries', async () => {
      await expect(translationService.clearExpiredCache()).resolves.not.toThrow();
    });
  });
});
