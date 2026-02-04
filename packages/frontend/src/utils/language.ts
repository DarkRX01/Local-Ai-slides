const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'yi'];

export function isRTL(languageCode: string): boolean {
  return RTL_LANGUAGES.includes(languageCode.toLowerCase());
}

export function getTextDirection(languageCode: string): 'ltr' | 'rtl' {
  return isRTL(languageCode) ? 'rtl' : 'ltr';
}

export function applyTextDirection(element: HTMLElement, languageCode: string): void {
  const direction = getTextDirection(languageCode);
  element.dir = direction;
  element.style.direction = direction;
}

const FONT_CACHE = new Map<string, boolean>();

export async function loadFontForLanguage(languageCode: string): Promise<void> {
  if (FONT_CACHE.has(languageCode)) {
    return;
  }

  const fontMap: Record<string, string[]> = {
    ar: ['Noto Sans Arabic', 'Arial'],
    he: ['Noto Sans Hebrew', 'Arial'],
    zh: ['Noto Sans SC', 'Noto Sans TC', 'Arial Unicode MS'],
    ja: ['Noto Sans JP', 'Arial Unicode MS'],
    ko: ['Noto Sans KR', 'Arial Unicode MS'],
    hi: ['Noto Sans Devanagari', 'Arial Unicode MS'],
    th: ['Noto Sans Thai', 'Arial Unicode MS'],
    ru: ['Noto Sans', 'Arial'],
    el: ['Noto Sans', 'Arial'],
    bn: ['Noto Sans Bengali', 'Arial Unicode MS'],
    ta: ['Noto Sans Tamil', 'Arial Unicode MS'],
    te: ['Noto Sans Telugu', 'Arial Unicode MS'],
    ml: ['Noto Sans Malayalam', 'Arial Unicode MS'],
    kn: ['Noto Sans Kannada', 'Arial Unicode MS'],
    gu: ['Noto Sans Gujarati', 'Arial Unicode MS'],
    pa: ['Noto Sans Gurmukhi', 'Arial Unicode MS'],
  };

  const fonts = fontMap[languageCode.toLowerCase()] || [];

  for (const fontFamily of fonts) {
    try {
      const googleFontName = fontFamily.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${googleFontName}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      await new Promise((resolve, reject) => {
        link.onload = resolve;
        link.onerror = reject;
        setTimeout(reject, 5000);
      });

      FONT_CACHE.set(languageCode, true);
      return;
    } catch (err) {
      console.warn(`Failed to load font ${fontFamily} for language ${languageCode}`, err);
    }
  }

  FONT_CACHE.set(languageCode, false);
}

export function getFontFamilyForLanguage(languageCode: string): string {
  const fontMap: Record<string, string> = {
    ar: 'Noto Sans Arabic, Arial, sans-serif',
    he: 'Noto Sans Hebrew, Arial, sans-serif',
    zh: 'Noto Sans SC, Noto Sans TC, Arial Unicode MS, sans-serif',
    ja: 'Noto Sans JP, Arial Unicode MS, sans-serif',
    ko: 'Noto Sans KR, Arial Unicode MS, sans-serif',
    hi: 'Noto Sans Devanagari, Arial Unicode MS, sans-serif',
    th: 'Noto Sans Thai, Arial Unicode MS, sans-serif',
    ru: 'Noto Sans, Arial, sans-serif',
    el: 'Noto Sans, Arial, sans-serif',
    bn: 'Noto Sans Bengali, Arial Unicode MS, sans-serif',
    ta: 'Noto Sans Tamil, Arial Unicode MS, sans-serif',
    te: 'Noto Sans Telugu, Arial Unicode MS, sans-serif',
    ml: 'Noto Sans Malayalam, Arial Unicode MS, sans-serif',
    kn: 'Noto Sans Kannada, Arial Unicode MS, sans-serif',
    gu: 'Noto Sans Gujarati, Arial Unicode MS, sans-serif',
    pa: 'Noto Sans Gurmukhi, Arial Unicode MS, sans-serif',
  };

  return fontMap[languageCode.toLowerCase()] || 'inherit';
}

export function detectLanguageFromText(text: string): string | null {
  const arabicPattern = /[\u0600-\u06FF]/;
  const hebrewPattern = /[\u0590-\u05FF]/;
  const chinesePattern = /[\u4E00-\u9FFF]/;
  const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/;
  const koreanPattern = /[\uAC00-\uD7AF]/;
  const thaiPattern = /[\u0E00-\u0E7F]/;
  const devanagariPattern = /[\u0900-\u097F]/;

  if (arabicPattern.test(text)) return 'ar';
  if (hebrewPattern.test(text)) return 'he';
  if (japanesePattern.test(text)) return 'ja';
  if (koreanPattern.test(text)) return 'ko';
  if (chinesePattern.test(text)) return 'zh';
  if (thaiPattern.test(text)) return 'th';
  if (devanagariPattern.test(text)) return 'hi';

  return null;
}

export function normalizeText(text: string): string {
  return text.normalize('NFC');
}

export function setupLanguageObserver(callback: (lang: string) => void): MutationObserver {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData' || mutation.type === 'childList') {
        const element = mutation.target as HTMLElement;
        const text = element.textContent || '';
        const detectedLang = detectLanguageFromText(text);
        if (detectedLang) {
          callback(detectedLang);
        }
      }
    });
  });

  return observer;
}
