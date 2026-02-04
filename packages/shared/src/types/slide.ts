import { SlideElement } from './element';
import { Animation } from './animation';

export interface Slide {
  id: string;
  presentationId: string;
  order: number;
  elements: SlideElement[];
  animations: Animation[];
  background: Background;
  notes?: string;
}

export interface Background {
  type: 'color' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    angle?: number;
  };
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'auto';
    position: string;
  };
}

export interface CreateSlideDto {
  presentationId: string;
  order?: number;
  background?: Background;
  notes?: string;
}

export interface UpdateSlideDto {
  order?: number;
  elements?: SlideElement[];
  animations?: Animation[];
  background?: Background;
  notes?: string;
}
