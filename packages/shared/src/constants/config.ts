export const DEFAULT_SLIDE_SIZE = {
  width: 1920,
  height: 1080,
};

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

export const SD_WEBUI_URL = process.env.SD_WEBUI_URL || 'http://localhost:7860';

export const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'http://localhost:5000';

export const DEFAULT_THEME = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981',
    background: '#ffffff',
    text: '#1f2937',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    code: 'Fira Code',
  },
  mode: 'light' as const,
};

export const ANIMATION_PRESETS = {
  FADE_IN: { type: 'fade', duration: 500, easing: 'ease-in-out' },
  SLIDE_LEFT: { type: 'slide', duration: 600, easing: 'ease-out' },
  ZOOM_IN: { type: 'zoom', duration: 700, easing: 'ease-in' },
  ROTATE_360: { type: 'rotate', duration: 1000, easing: 'ease-in-out' },
};
