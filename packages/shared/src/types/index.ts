export interface Presentation {
  id: string
  title: string
  description?: string
  slides: Slide[]
  theme: Theme
  createdAt: string
  updatedAt: string
}

export interface Slide {
  id: string
  presentationId: string
  order: number
  elements: SlideElement[]
  background?: Background
  transition?: Transition
  notes?: string
}

export interface SlideElement {
  id: string
  type: ElementType
  position: Position
  size: Size
  rotation: number
  style: ElementStyle
  content: unknown
  zIndex: number
}

export type ElementType = 'text' | 'image' | 'shape' | 'video' | 'embed'

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface ElementStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  shadow?: Shadow
  fontFamily?: string
  fontSize?: number
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  color?: string
}

export interface Shadow {
  offsetX: number
  offsetY: number
  blur: number
  color: string
}

export interface Background {
  type: 'solid' | 'gradient' | 'image'
  value: string | Gradient
}

export interface Gradient {
  type: 'linear' | 'radial'
  colors: GradientStop[]
}

export interface GradientStop {
  color: string
  offset: number
}

export interface Transition {
  type: TransitionType
  duration: number
  easing?: string
}

export type TransitionType =
  | 'none'
  | 'fade'
  | 'slide'
  | 'zoom'
  | 'rotate'
  | 'flip'
  | 'cube'
  | 'custom'

export interface Theme {
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
}

export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  text: string
  accent: string
}

export interface ThemeFonts {
  heading: string
  body: string
  code: string
}

export interface Animation {
  id: string
  elementId: string
  type: AnimationType
  trigger: AnimationTrigger
  duration: number
  delay: number
  easing: string
  keyframes: Keyframe[]
}

export type AnimationType =
  | 'fadeIn'
  | 'fadeOut'
  | 'slideIn'
  | 'slideOut'
  | 'zoomIn'
  | 'zoomOut'
  | 'rotate'
  | 'bounce'
  | 'custom'

export type AnimationTrigger = 'onLoad' | 'onClick' | 'onHover' | 'sequence'

export interface Keyframe {
  offset: number
  properties: Record<string, unknown>
}

export interface ExportOptions {
  format: ExportFormat
  quality?: 'draft' | 'standard' | 'hd'
  includeAnimations?: boolean
  range?: SlideRange
}

export type ExportFormat = 'pdf' | 'pptx' | 'html' | 'video' | 'images'

export interface SlideRange {
  start: number
  end: number
}

export interface AIGenerationRequest {
  prompt: string
  model?: string
  slideCount?: number
  theme?: string
  language?: string
}

export interface AIGenerationResponse {
  presentation: Presentation
  metadata: {
    model: string
    tokensUsed: number
    duration: number
  }
}

export interface ImageGenerationRequest {
  prompt: string
  width?: number
  height?: number
  steps?: number
  seed?: number
}

export interface TranslationRequest {
  text: string
  targetLanguage: string
  sourceLanguage?: string
}

export interface TranslationResponse {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
}

export interface BatchTranslationRequest {
  texts: string[]
  targetLanguage: string
  sourceLanguage?: string
}

export interface BatchTranslationResponse {
  translations: string[]
  sourceLanguage: string
  targetLanguage: string
}

export interface LanguageDetectionRequest {
  text: string
}

export interface LanguageDetectionResponse {
  language: string
  confidence: number
}

export interface LanguageInfo {
  code: string
  name: string
  targets?: string[]
}

export interface SlideTranslationRequest {
  slideId: string
  targetLanguage: string
  sourceLanguage?: string
}

export interface PresentationTranslationRequest {
  presentationId: string
  targetLanguage: string
  sourceLanguage?: string
}

export interface PresentationTranslationResponse {
  presentationId: string
  slidesTranslated: number
  sourceLanguage: string
  targetLanguage: string
}

export interface CacheEntry {
  id: string
  key: string
  value: string
  type: 'ai' | 'image' | 'translation'
  createdAt: string
  expiresAt?: string
}

export * from './voice'
