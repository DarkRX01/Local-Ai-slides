import { AIService } from '../aiService';
import type { AIGenerationRequest } from '@presentation-app/shared';

global.fetch = jest.fn();

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkHealth', () => {
    it('should return true when Ollama is available', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      const result = await AIService.checkHealth();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tags'),
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });

    it('should return false when Ollama is unavailable', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection refused'));

      const result = await AIService.checkHealth();
      expect(result).toBe(false);
    });

    it('should handle timeout', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 10000))
      );

      const result = await AIService.checkHealth();
      expect(result).toBe(false);
    });
  });

  describe('listModels', () => {
    it('should return list of available models', async () => {
      const mockModels = [
        { name: 'llama3' },
        { name: 'mistral' },
        { name: 'codellama' },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: mockModels }),
      });

      const result = await AIService.listModels();
      expect(result).toEqual(['llama3', 'mistral', 'codellama']);
    });

    it('should return empty array on error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await AIService.listModels();
      expect(result).toEqual([]);
    });
  });

  describe('generate', () => {
    it('should generate text from prompt', async () => {
      const mockResponse = {
        model: 'llama3',
        created_at: new Date().toISOString(),
        response: 'Generated text response',
        done: true,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await AIService.generate('Test prompt', 'llama3');
      expect(result).toBe('Generated text response');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/generate'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test prompt'),
        })
      );
    });

    it('should handle API errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Model not found',
      });

      await expect(AIService.generate('Test prompt')).rejects.toThrow('Ollama API error');
    });

    it('should handle timeout', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 200000))
      );

      await expect(AIService.generate('Test prompt')).rejects.toThrow('AI request timed out');
    });
  });

  describe('generatePresentation', () => {
    it('should generate a presentation from request', async () => {
      const mockAIResponse = JSON.stringify({
        title: 'Test Presentation',
        slides: [
          {
            title: 'Slide 1',
            content: ['Point 1', 'Point 2', 'Point 3'],
            notes: 'Speaker notes',
          },
          {
            title: 'Slide 2',
            content: ['Point A', 'Point B'],
          },
        ],
      });

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3',
          created_at: new Date().toISOString(),
          response: mockAIResponse,
          done: true,
        }),
      });

      const request: AIGenerationRequest = {
        prompt: 'Create a test presentation',
        slideCount: 2,
        language: 'en',
      };

      const result = await AIService.generatePresentation(request);

      expect(result.status).toBe('success');
      expect(result.presentationId).toBeDefined();
      expect(result.slides).toHaveLength(2);
      expect(result.slides[0].elements).toBeDefined();
    });

    it('should handle malformed AI response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3',
          response: 'This is not valid JSON',
          done: true,
        }),
      });

      const request: AIGenerationRequest = {
        prompt: 'Create a test presentation',
        slideCount: 1,
      };

      const result = await AIService.generatePresentation(request);

      expect(result.status).toBe('success');
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0].elements[0].content.text).toContain('Error');
    });

    it('should handle generation errors gracefully', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const request: AIGenerationRequest = {
        prompt: 'Create a test presentation',
        slideCount: 1,
      };

      const result = await AIService.generatePresentation(request);

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
      expect(result.slides).toEqual([]);
    });
  });

  describe('enhanceSlide', () => {
    it('should enhance slide content', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3',
          response: 'Enhanced content with better structure and clarity.',
          done: true,
        }),
      });

      const result = await AIService.enhanceSlide({
        slideId: 'test-slide-id',
        type: 'content',
        context: 'Make it more professional',
      });

      expect(result.status).toBe('success');
      expect(result.suggestions).toBeDefined();
      expect(result.slideId).toBe('test-slide-id');
    });

    it('should suggest animations', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3',
          response: 'Use fade-in for title, slide-in for bullet points, emphasize key metrics.',
          done: true,
        }),
      });

      const result = await AIService.enhanceSlide({
        slideId: 'test-slide-id',
        type: 'animations',
      });

      expect(result.status).toBe('success');
      expect(result.type).toBe('animations');
    });

    it('should handle non-existent slide', async () => {
      const result = await AIService.enhanceSlide({
        slideId: 'non-existent-id',
        type: 'content',
      });

      expect(result.status).toBe('failed');
      expect(result.error).toBeDefined();
    });
  });

  describe('suggestAnimations', () => {
    it('should suggest animations for a slide', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          model: 'llama3',
          response: 'Suggested animations: fade, zoom, slide-in',
          done: true,
        }),
      });

      const result = await AIService.suggestAnimations('test-slide-id', 'Product launch slide');

      expect(result.status).toBe('success');
      expect(result.type).toBe('animations');
      expect(result.suggestions).toContain('fade');
    });
  });

  describe('generateStreaming', () => {
    it('should stream text chunks', async () => {
      const mockChunks = [
        { response: 'Hello', done: false },
        { response: ' world', done: false },
        { response: '!', done: true },
      ];

      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(JSON.stringify(mockChunks[0]) + '\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(JSON.stringify(mockChunks[1]) + '\n'),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(JSON.stringify(mockChunks[2]) + '\n'),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      });

      const chunks: string[] = [];
      const stream = AIService.generateStreaming('Test prompt');

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' world', '!']);
    });

    it('should handle streaming errors', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const stream = AIService.generateStreaming('Test prompt');

      await expect(async () => {
        for await (const _chunk of stream) {
          // Stream iteration
        }
      }).rejects.toThrow('Ollama API error');
    });
  });
});
