import { Router } from 'express';
import { AIService } from '../services/aiService';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const generatePresentationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  slideCount: z.number().min(1).max(50),
  language: z.string().optional(),
  theme: z.string().optional(),
  includeImages: z.boolean().optional(),
  animationLevel: z.enum(['none', 'basic', 'advanced']).optional(),
  options: z.object({
    temperature: z.number().min(0).max(2).optional(),
    model: z.string().optional(),
  }).optional(),
});

const enhanceSlideSchema = z.object({
  slideId: z.string(),
  type: z.enum(['content', 'layout', 'animations']),
  context: z.string().optional(),
});

const generateTextSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

router.get('/health', async (_req, res, next) => {
  try {
    const isHealthy = await AIService.checkHealth();
    res.json({ 
      status: isHealthy ? 'ok' : 'unavailable',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    next(error);
  }
});

router.get('/models', async (_req, res, next) => {
  try {
    const models = await AIService.listModels();
    res.json({ models });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/generate',
  validateBody(generatePresentationSchema),
  async (req, res, next) => {
    try {
      const result = await AIService.generatePresentation(req.body);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/generate/stream',
  validateBody(generateTextSchema),
  async (req, res, next) => {
    try {
      const { prompt, model, temperature } = req.body;
      
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = AIService.generateStreaming(prompt, model, { temperature });

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/enhance',
  validateBody(enhanceSlideSchema),
  async (req, res, next) => {
    try {
      const result = await AIService.enhanceSlide(req.body);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/suggest-animations/:slideId',
  async (req, res, next) => {
    try {
      const { slideId } = req.params;
      const { context } = req.body;
      
      const result = await AIService.suggestAnimations(slideId, context);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/text',
  validateBody(generateTextSchema),
  async (req, res, next) => {
    try {
      const { prompt, model, temperature } = req.body;
      const result = await AIService.generate(prompt, model, { temperature });
      
      res.json({ text: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
