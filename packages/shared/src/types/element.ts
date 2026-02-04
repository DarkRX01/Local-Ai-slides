export type ElementType = 'text' | 'image' | 'shape' | 'video' | 'chart' | 'code';

export interface SlideElement {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  properties: ElementProperties;
  locked?: boolean;
}

export type ElementProperties = 
  | TextProperties 
  | ImageProperties 
  | ShapeProperties 
  | VideoProperties 
  | ChartProperties 
  | CodeProperties;

export interface TextProperties {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle: 'normal' | 'italic';
  color: string;
  align: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageProperties {
  type: 'image';
  url: string;
  alt?: string;
  opacity: number;
  filters?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    saturation?: number;
  };
}

export interface ShapeProperties {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'polygon' | 'line' | 'arrow';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  opacity: number;
}

export interface VideoProperties {
  type: 'video';
  url: string;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
}

export interface ChartProperties {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  data: any;
  options: any;
}

export interface CodeProperties {
  type: 'code';
  language: string;
  code: string;
  theme: 'light' | 'dark';
  showLineNumbers: boolean;
}
