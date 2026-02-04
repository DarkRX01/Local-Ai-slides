import type { 
  SlideElement,
  TextProperties
} from '@presentation-app/shared';
import { CacheService } from './cacheService';
import { PresentationModel } from '../models/Presentation';
import { SlideModel } from '../models/Slide';

interface AIGenerationRequest {
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

interface AIGenerationResponse {
  presentationId: string;
  slides: any[];
  status: 'success' | 'partial' | 'failed';
  error?: string;
}

interface AIEnhancementRequest {
  slideId: string;
  type: 'content' | 'layout' | 'animations';
  context?: string;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

interface PresentationContent {
  title: string;
  slides: Array<{
    title: string;
    content: string[];
    notes?: string;
  }>;
}

export class AIService {
  private static OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  private static DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3';
  private static REQUEST_TIMEOUT = 120000;

  static async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/tags`, {
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json() as { models?: Array<{ name: string }> };
      return data.models?.map((m) => m.name) || [];
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  static async generate(
    prompt: string,
    model: string = this.DEFAULT_MODEL,
    options?: { temperature?: number; stream?: boolean }
  ): Promise<string> {
    const cacheKey = `ai:${model}:${prompt}`;
    
    if (!options?.stream) {
      const cached = await CacheService.aiCache(
        cacheKey,
        async () => this.callOllama(prompt, model, options)
      );
      return cached;
    }
    
    return this.callOllama(prompt, model, options);
  }

  private static async callOllama(
    prompt: string,
    model: string,
    options?: { temperature?: number; stream?: boolean }
  ): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const requestBody: OllamaGenerateRequest = {
        model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
        }
      };

      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json() as OllamaResponse;
      return data.response;
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('AI request timed out');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  static async generatePresentation(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const model = request.options?.model || this.DEFAULT_MODEL;
      const temperature = request.options?.temperature ?? 0.7;

      const prompt = this.buildPresentationPrompt(request);
      const rawResponse = await this.generate(prompt, model, { temperature });

      const presentationContent = this.parsePresentationResponse(rawResponse);
      
      const presentation = PresentationModel.create({
        title: presentationContent.title,
        description: `Generated from: ${request.prompt}`
      });

      const slides = presentationContent.slides.map((slideData, index) => {
        const elements: SlideElement[] = [
          {
            id: `title-${index}`,
            type: 'text',
            position: { x: 50, y: 50 },
            size: { width: 700, height: 80 },
            rotation: 0,
            zIndex: 1,
            properties: {
              type: 'text',
              content: slideData.title,
              fontFamily: 'Inter',
              fontSize: 48,
              fontWeight: 'bold',
              fontStyle: 'normal',
              color: '#000000',
              align: 'center',
              lineHeight: 1.2,
              letterSpacing: 0
            } as TextProperties
          },
          ...slideData.content.map((text, i) => ({
            id: `content-${index}-${i}`,
            type: 'text' as const,
            position: { x: 80, y: 150 + (i * 60) },
            size: { width: 640, height: 50 },
            rotation: 0,
            zIndex: i + 2,
            properties: {
              type: 'text',
              content: `• ${text}`,
              fontFamily: 'Inter',
              fontSize: 24,
              fontWeight: 'normal',
              fontStyle: 'normal',
              color: '#333333',
              align: 'left',
              lineHeight: 1.4,
              letterSpacing: 0
            } as TextProperties
          }))
        ];

        const slide = SlideModel.create({
          presentationId: presentation.id,
          order: index,
          background: { type: 'color', color: '#ffffff' },
          notes: slideData.notes
        });

        SlideModel.update(slide.id, { elements });

        return SlideModel.findById(slide.id)!;
      });

      return {
        presentationId: presentation.id,
        slides,
        status: 'success'
      };
    } catch (error) {
      console.error('Error generating presentation:', error);
      return {
        presentationId: '',
        slides: [],
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async enhanceSlide(request: AIEnhancementRequest): Promise<any> {
    try {
      const slide = SlideModel.findById(request.slideId);
      if (!slide) {
        throw new Error('Slide not found');
      }

      let prompt = '';
      
      if (request.type === 'content') {
        const currentContent = slide.elements
          .filter((el: SlideElement) => el.type === 'text')
          .map((el: SlideElement) => (el.properties as TextProperties).content)
          .join('\n');
        
        prompt = `Improve and enhance the following slide content. Make it more engaging, clear, and professional. ${request.context ? `Context: ${request.context}` : ''}

Current content:
${currentContent}

Provide improved content in a structured format with clear bullet points.`;
      } else if (request.type === 'layout') {
        prompt = `Suggest an optimal layout for a slide with the following content. Provide specific positions and sizes for elements.
        
Context: ${request.context || 'General presentation slide'}

Respond with JSON format for element positioning.`;
      } else if (request.type === 'animations') {
        prompt = `Suggest appropriate animations for a slide with this content: ${request.context || 'presentation slide'}
        
Suggest animation types, timings, and order. Consider:
- Entrance animations for new elements
- Emphasis for key points
- Exit animations if needed
- Overall coherence and professionalism`;
      }

      const model = this.DEFAULT_MODEL;
      const response = await this.generate(prompt, model);

      return {
        slideId: request.slideId,
        type: request.type,
        suggestions: response,
        status: 'success'
      };
    } catch (error) {
      console.error('Error enhancing slide:', error);
      return {
        slideId: request.slideId,
        type: request.type,
        suggestions: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async suggestAnimations(slideId: string, context?: string): Promise<any> {
    return this.enhanceSlide({
      slideId,
      type: 'animations',
      context
    });
  }

  private static buildPresentationPrompt(request: AIGenerationRequest): string {
    const { prompt, slideCount, language, theme, includeImages, animationLevel } = request;

    const fullPrompt = `You are a professional presentation creator. Create a presentation with exactly ${slideCount} slides based on the following topic:

Topic: ${prompt}

${language ? `Language: ${language}` : ''}
${theme ? `Theme/Style: ${theme}` : ''}

Instructions:
1. Create ${slideCount} distinct slides
2. Each slide should have a clear title
3. Each slide should have 3-5 bullet points with concise, impactful content
4. Make the content engaging, informative, and well-structured
5. Include speaker notes for each slide if relevant
${includeImages ? '6. Suggest relevant images for slides where visual content would enhance understanding' : ''}
${animationLevel !== 'none' ? `7. Consider ${animationLevel} level animations for transitions and element reveals` : ''}

Format your response as JSON with this structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "notes": "Speaker notes for this slide"
    }
  ]
}

Provide ONLY the JSON response, no additional text.`;

    return fullPrompt;
  }

  private static parsePresentationResponse(response: string): PresentationContent {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.title || !Array.isArray(parsed.slides)) {
        throw new Error('Invalid presentation structure');
      }

      return {
        title: parsed.title,
        slides: parsed.slides.map((slide: any) => ({
          title: slide.title || 'Untitled Slide',
          content: Array.isArray(slide.content) ? slide.content : [],
          notes: slide.notes
        }))
      };
    } catch (error) {
      console.error('Error parsing presentation response:', error);
      
      return {
        title: 'Generated Presentation',
        slides: [
          {
            title: 'Error',
            content: ['Failed to parse AI response', 'Please try again'],
            notes: 'AI response parsing error'
          }
        ]
      };
    }
  }

  static async *generateStreaming(
    prompt: string,
    model: string = this.DEFAULT_MODEL,
    options?: { temperature?: number }
  ): AsyncGenerator<string, void, unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const requestBody: OllamaGenerateRequest = {
        model,
        prompt,
        stream: true,
        options: {
          temperature: options?.temperature ?? 0.7,
        }
      };

      const response = await fetch(`${this.OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data: OllamaResponse = JSON.parse(line);
            if (data.response) {
              yield data.response;
            }
            if (data.done) {
              clearTimeout(timeout);
              return;
            }
          } catch (e) {
            console.error('Error parsing streaming chunk:', e);
          }
        }
      }

      clearTimeout(timeout);
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('AI request timed out');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }
}
