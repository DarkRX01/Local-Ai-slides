import { useEffect, useState } from 'react';
import { 
  isRTL, 
  getTextDirection, 
  applyTextDirection, 
  loadFontForLanguage,
  getFontFamilyForLanguage,
  detectLanguageFromText,
  normalizeText
} from '@/utils/language';

export function useLanguage(languageCode?: string) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(languageCode || 'en');
  const [isLoadingFont, setIsLoadingFont] = useState(false);
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    if (languageCode) {
      setCurrentLanguage(languageCode);
    }
  }, [languageCode]);

  useEffect(() => {
    const loadFont = async () => {
      if (currentLanguage && currentLanguage !== 'en') {
        setIsLoadingFont(true);
        try {
          await loadFontForLanguage(currentLanguage);
          setFontLoaded(true);
        } catch (err) {
          console.error('Failed to load font:', err);
        } finally {
          setIsLoadingFont(false);
        }
      }
    };

    loadFont();
  }, [currentLanguage]);

  const applyLanguageToElement = (element: HTMLElement | null) => {
    if (element && currentLanguage) {
      applyTextDirection(element, currentLanguage);
      const fontFamily = getFontFamilyForLanguage(currentLanguage);
      if (fontFamily !== 'inherit') {
        element.style.fontFamily = fontFamily;
      }
    }
  };

  return {
    languageCode: currentLanguage,
    isRTL: isRTL(currentLanguage),
    direction: getTextDirection(currentLanguage),
    fontFamily: getFontFamilyForLanguage(currentLanguage),
    isLoadingFont,
    fontLoaded,
    applyToElement: applyLanguageToElement,
    setLanguage: setCurrentLanguage,
    detectLanguage: detectLanguageFromText,
    normalizeText,
  };
}

export function useAutoLanguageDetection(text: string) {
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (text) {
      const lang = detectLanguageFromText(text);
      setDetectedLanguage(lang);
    }
  }, [text]);

  return detectedLanguage;
}
