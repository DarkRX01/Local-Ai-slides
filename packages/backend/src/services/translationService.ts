import { db } from '../utils/database';
import crypto from 'crypto';

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';
const CACHE_EXPIRY_DAYS = 30;

interface TranslateRequest {
  q: string;
  source: string;
  target: string;
  format?: 'text' | 'html';
  api_key?: string;
}

interface TranslateResponse {
  translatedText: string;
  detectedLanguage?: {
    confidence: number;
    language: string;
  };
}

interface DetectLanguageRequest {
  q: string;
  api_key?: string;
}

interface DetectLanguageResponse {
  confidence: number;
  language: string;
}

interface LanguageInfo {
  code: string;
  name: string;
  targets?: string[];
}

interface TranslationCacheEntry {
  id: string;
  text: string;
  source_language: string;
  target_language: string;
  translated_text: string;
  created_at: string;
  expires_at: string | null;
}

export class TranslationService {
  private async checkLibreTranslateHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${LIBRETRANSLATE_URL}/languages`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableLanguages(): Promise<LanguageInfo[]> {
    try {
      const response = await fetch(`${LIBRETRANSLATE_URL}/languages`);
      if (!response.ok) {
        throw new Error(`LibreTranslate API error: ${response.statusText}`);
      }
      return await response.json() as LanguageInfo[];
    } catch (error) {
      console.error('Failed to fetch available languages:', error);
      return this.getFallbackLanguages();
    }
  }

  private getFallbackLanguages(): LanguageInfo[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
    ];
  }

  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    const cacheKey = `detect:${crypto.createHash('md5').update(text).digest('hex')}`;
    
    const cached = this.getCachedDetection(cacheKey);
    if (cached) {
      return cached;
    }

    const isHealthy = await this.checkLibreTranslateHealth();
    if (!isHealthy) {
      throw new Error('LibreTranslate service is not available. Please ensure it is running on port 5000.');
    }

    try {
      const requestBody: DetectLanguageRequest = {
        q: text,
      };

      const response = await fetch(`${LIBRETRANSLATE_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate API error: ${response.statusText}`);
      }

      const results = await response.json() as DetectLanguageResponse[];
      const result = results[0];
      
      this.cacheDetection(cacheKey, result.language, result.confidence);
      
      return {
        language: result.language,
        confidence: result.confidence,
      };
    } catch (error) {
      console.error('Language detection failed:', error);
      return { language: 'en', confidence: 0 };
    }
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> {
    if (!text || text.trim() === '') {
      return text;
    }

    if (!sourceLanguage || sourceLanguage === 'auto') {
      const detected = await this.detectLanguage(text);
      sourceLanguage = detected.language;
    }

    if (sourceLanguage === targetLanguage) {
      return text;
    }

    const cached = this.getCachedTranslation(text, sourceLanguage, targetLanguage);
    if (cached) {
      return cached;
    }

    const isHealthy = await this.checkLibreTranslateHealth();
    if (!isHealthy) {
      throw new Error('LibreTranslate service is not available. Please ensure it is running on port 5000.');
    }

    try {
      const requestBody: TranslateRequest = {
        q: text,
        source: sourceLanguage,
        target: targetLanguage,
        format: 'text',
      };

      const response = await fetch(`${LIBRETRANSLATE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`LibreTranslate API error: ${response.statusText}`);
      }

      const result = await response.json() as TranslateResponse;
      const translatedText = result.translatedText;

      this.cacheTranslation(text, sourceLanguage, targetLanguage, translatedText);

      return translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      throw error;
    }
  }

  async translateBatch(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    const translations = await Promise.all(
      texts.map(text => this.translate(text, targetLanguage, sourceLanguage))
    );
    return translations;
  }

  async translateSlide(
    slideId: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{
    id: string;
    elements: unknown[];
    notes: string | null;
  }> {
    const slide = db.prepare('SELECT * FROM slides WHERE id = ?').get(slideId) as {
      id: string;
      elements: string;
      notes: string | null;
    } | undefined;
    
    if (!slide) {
      throw new Error('Slide not found');
    }

    const elements = JSON.parse(slide.elements) as Array<{
      type: string;
      content?: string;
      [key: string]: unknown;
    }>;
    const translatedElements = await Promise.all(
      elements.map(async (element) => {
        if (element.type === 'text' && element.content) {
          const translatedContent = await this.translate(
            element.content,
            targetLanguage,
            sourceLanguage
          );
          return { ...element, content: translatedContent };
        }
        return element;
      })
    );

    let translatedNotes = slide.notes;
    if (slide.notes) {
      translatedNotes = await this.translate(slide.notes, targetLanguage, sourceLanguage);
    }

    return {
      ...slide,
      elements: translatedElements,
      notes: translatedNotes,
    };
  }

  async translatePresentation(
    presentationId: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{ presentationId: string; slidesTranslated: number }> {
    const presentation = db.prepare('SELECT * FROM presentations WHERE id = ?').get(presentationId) as {
      id: string;
      title: string | null;
      description: string | null;
    } | undefined;
    
    if (!presentation) {
      throw new Error('Presentation not found');
    }

    const slides = db.prepare('SELECT * FROM slides WHERE presentation_id = ? ORDER BY order_index ASC')
      .all(presentationId) as Array<{
        id: string;
        elements: string;
        notes: string | null;
      }>;

    let slidesTranslated = 0;

    for (const slide of slides) {
      const elements = JSON.parse(slide.elements) as Array<{
        type: string;
        content?: string;
        id: string;
        [key: string]: unknown;
      }>;
      const translatedElements = await Promise.all(
        elements.map(async (element) => {
          if (element.type === 'text' && element.content) {
            try {
              const translatedContent = await this.translate(
                element.content,
                targetLanguage,
                sourceLanguage
              );
              return { ...element, content: translatedContent };
            } catch (error) {
              console.error(`Failed to translate element ${element.id}:`, error);
              return element;
            }
          }
          return element;
        })
      );

      let translatedNotes = slide.notes;
      if (slide.notes) {
        try {
          translatedNotes = await this.translate(slide.notes, targetLanguage, sourceLanguage);
        } catch (error) {
          console.error(`Failed to translate notes for slide ${slide.id}:`, error);
        }
      }

      db.prepare(`
        UPDATE slides 
        SET elements = ?, notes = ?
        WHERE id = ?
      `).run(JSON.stringify(translatedElements), translatedNotes, slide.id);

      slidesTranslated++;
    }

    if (presentation.title) {
      try {
        const translatedTitle = await this.translate(presentation.title, targetLanguage, sourceLanguage);
        db.prepare('UPDATE presentations SET title = ?, updated_at = ? WHERE id = ?')
          .run(translatedTitle, new Date().toISOString(), presentationId);
      } catch (error) {
        console.error('Failed to translate presentation title:', error);
      }
    }

    if (presentation.description) {
      try {
        const translatedDescription = await this.translate(presentation.description, targetLanguage, sourceLanguage);
        db.prepare('UPDATE presentations SET description = ?, updated_at = ? WHERE id = ?')
          .run(translatedDescription, new Date().toISOString(), presentationId);
      } catch (error) {
        console.error('Failed to translate presentation description:', error);
      }
    }

    return {
      presentationId,
      slidesTranslated,
    };
  }

  private getCachedTranslation(
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): string | null {
    try {
      const now = new Date().toISOString();
      const result = db.prepare(`
        SELECT translated_text 
        FROM translation_cache 
        WHERE text = ? 
          AND source_language = ? 
          AND target_language = ?
          AND (expires_at IS NULL OR expires_at > ?)
      `).get(text, sourceLanguage, targetLanguage, now) as TranslationCacheEntry | undefined;

      return result?.translated_text || null;
    } catch (error) {
      console.error('Error reading translation cache:', error);
      return null;
    }
  }

  private cacheTranslation(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    translatedText: string
  ): void {
    try {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT OR REPLACE INTO translation_cache 
        (id, text, source_language, target_language, translated_text, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, text, sourceLanguage, targetLanguage, translatedText, createdAt, expiresAt);
    } catch (error) {
      console.error('Error caching translation:', error);
    }
  }

  private getCachedDetection(cacheKey: string): { language: string; confidence: number } | null {
    try {
      const now = new Date().toISOString();
      const result = db.prepare(`
        SELECT value 
        FROM cache 
        WHERE key = ? 
          AND type = 'language-detection'
          AND (expires_at IS NULL OR expires_at > ?)
      `).get(cacheKey, now) as { value: string } | undefined;

      if (result) {
        return JSON.parse(result.value);
      }
      return null;
    } catch (error) {
      console.error('Error reading detection cache:', error);
      return null;
    }
  }

  private cacheDetection(cacheKey: string, language: string, confidence: number): void {
    try {
      const id = crypto.randomUUID();
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const value = JSON.stringify({ language, confidence });

      db.prepare(`
        INSERT OR REPLACE INTO cache 
        (id, key, value, type, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, cacheKey, value, 'language-detection', createdAt, expiresAt);
    } catch (error) {
      console.error('Error caching detection:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      db.prepare('DELETE FROM translation_cache').run();
      db.prepare('DELETE FROM cache WHERE type = ?').run('language-detection');
    } catch (error) {
      console.error('Error clearing translation cache:', error);
      throw error;
    }
  }

  async clearExpiredCache(): Promise<void> {
    try {
      const now = new Date().toISOString();
      db.prepare('DELETE FROM translation_cache WHERE expires_at IS NOT NULL AND expires_at < ?').run(now);
      db.prepare('DELETE FROM cache WHERE type = ? AND expires_at IS NOT NULL AND expires_at < ?')
        .run('language-detection', now);
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }
}

export const translationService = new TranslationService();
