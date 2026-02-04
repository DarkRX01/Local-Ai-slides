export interface AIGenerationRequest {
  prompt: string;
  slideCount: number;
  language?: string;
  theme?: string;
  includeImages?: boolean;
  animationLevel?: 'none' | 'basic' | 'advanced';
  options?: {
    temperature?: number;
    model?: string;
  };
}

export interface AIGenerationResponse {
  presentationId: string;
  slides: any[];
  status: 'success' | 'partial' | 'failed';
  error?: string;
}

export interface AIEnhancementRequest {
  slideId: string;
  type: 'content' | 'layout' | 'animations';
  context?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  width?: number;
  height?: number;
  steps?: number;
  model?: string;
}
