import { Slide } from './slide';
import { Theme } from './theme';

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  theme: Theme;
  slides: Slide[];
  settings: PresentationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface PresentationSettings {
  slideSize: {
    width: number;
    height: number;
  };
  aspectRatio: '16:9' | '4:3' | 'custom';
  autoSave: boolean;
  autoSaveInterval?: number;
}

export interface CreatePresentationDto {
  title: string;
  description?: string;
  theme?: Partial<Theme>;
  settings?: Partial<PresentationSettings>;
}

export interface UpdatePresentationDto {
  title?: string;
  description?: string;
  theme?: Partial<Theme>;
  settings?: Partial<PresentationSettings>;
}
