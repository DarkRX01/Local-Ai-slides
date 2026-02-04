export const DEFAULT_SLIDE_SIZE = {
  width: 1920,
  height: 1080,
}

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const

export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/webm',
  'video/ogg',
] as const

export const ANIMATION_EASINGS = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier',
] as const

export const DEFAULT_THEME = {
  name: 'Default',
  colors: {
    primary: '#0ea5e9',
    secondary: '#6366f1',
    background: '#ffffff',
    text: '#1f2937',
    accent: '#f59e0b',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    code: 'Fira Code',
  },
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'hi', name: 'Hindi' },
] as const

export const AI_MODELS = [
  { id: 'llama3', name: 'Llama 3', provider: 'ollama' },
  { id: 'mistral', name: 'Mistral', provider: 'ollama' },
  { id: 'codellama', name: 'CodeLlama', provider: 'ollama' },
] as const

export const MAX_SLIDES_PER_PRESENTATION = 500
export const MAX_ELEMENTS_PER_SLIDE = 100
export const MAX_FILE_SIZE_MB = 50
