export interface Presentation {
  id: string;
  title: string;
  description?: string;
  slides: Slide[];
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: string;
  presentationId: string;
  order: number;
  elements: SlideElement[];
  background?: Background;
  animations?: Animation[];
  notes?: string;
}

export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'video';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  data: TextData | ImageData | ShapeData | VideoData;
}

export interface TextData {
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
}

export interface ImageData {
  src: string;
  alt?: string;
  filters?: ImageFilters;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
}

export interface ShapeData {
  shape: 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow';
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface VideoData {
  src: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

export interface Background {
  type: 'color' | 'gradient' | 'image';
  value: string;
}

export interface Animation {
  id: string;
  elementId: string;
  type: 'fade' | 'slide' | 'zoom' | 'rotate' | 'morph' | '3d' | 'particle';
  duration: number;
  delay: number;
  easing: string;
  direction?: 'in' | 'out';
  properties: Record<string, unknown>;
}

export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    border: string;
    panel: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

export interface Settings {
  language: string;
  theme: Theme;
  autoSave: boolean;
  autoSaveInterval: number;
  gridSize: number;
  snapToGrid: boolean;
  showGuides: boolean;
  aiModel: string;
  imageQuality: 'draft' | 'standard' | 'hd';
}
