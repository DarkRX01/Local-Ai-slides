import { Router, Request, Response } from 'express';
import { imageService } from '../services/imageService';
import { validateBody, validateQuery } from '../middleware/validation';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const sdAvailable = await imageService.checkSDAvailability();
    res.json({
      stableDiffusion: sdAvailable,
      googleSearch: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check service health' });
  }
});

const generateSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  negativePrompt: z.string().optional(),
  width: z.number().int().min(64).max(2048).optional(),
  height: z.number().int().min(64).max(2048).optional(),
  steps: z.number().int().min(1).max(150).optional(),
  cfgScale: z.number().min(1).max(30).optional(),
});

router.post(
  '/generate',
  validateBody(generateSchema),
  async (req: Request, res: Response) => {
    try {
      const jobId = await imageService.generateImage({
        prompt: req.body.prompt,
        negativePrompt: req.body.negativePrompt,
        width: req.body.width,
        height: req.body.height,
        steps: req.body.steps,
        cfgScale: req.body.cfgScale,
      });

      res.json({ jobId });
    } catch (error) {
      console.error('Image generation failed:', error);
      res.status(500).json({ 
        error: 'Failed to generate image',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get('/job/:jobId', async (req: Request, res: Response) => {
  try {
    const job = await imageService.getJobStatus(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required'),
  count: z.string().transform((v: string) => parseInt(v) || 10).pipe(z.number().int().min(1).max(10)).optional(),
});

router.get(
  '/search/google',
  validateQuery(searchQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const count = (req.query.count as unknown as number) || 10;

      const results = await imageService.searchGoogleImages(query, count);
      res.json({ results });
    } catch (error) {
      console.error('Google image search failed:', error);
      res.status(500).json({ 
        error: 'Failed to search images',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

const scrapeQuerySchema = z.object({
  q: z.string().min(1, 'Query is required'),
  count: z.string().transform((v: string) => parseInt(v) || 10).pipe(z.number().int().min(1).max(20)).optional(),
});

router.get(
  '/search/scrape',
  validateQuery(scrapeQuerySchema),
  async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      const count = (req.query.count as unknown as number) || 10;

      const results = await imageService.scrapeImages(query, count);
      res.json({ results });
    } catch (error) {
      console.error('Image scraping failed:', error);
      res.status(500).json({ 
        error: 'Failed to scrape images',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

const downloadSchema = z.object({
  url: z.string().url('Valid URL is required'),
});

router.post(
  '/download',
  validateBody(downloadSchema),
  async (req: Request, res: Response) => {
    try {
      const filename = await imageService.downloadImage(req.body.url);
      res.json({ filename, url: `/api/images/file/${filename}` });
    } catch (error) {
      console.error('Image download failed:', error);
      res.status(500).json({ 
        error: 'Failed to download image',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

const processSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  resize: z.object({ width: z.number().optional(), height: z.number().optional() }).optional(),
  compress: z.boolean().optional(),
  format: z.enum(['jpeg', 'png', 'webp']).optional(),
  quality: z.number().min(1).max(100).optional(),
  filters: z.object({
    grayscale: z.boolean().optional(),
    blur: z.number().optional(),
    sharpen: z.boolean().optional(),
    rotate: z.number().optional(),
  }).optional(),
});

router.post(
  '/process',
  validateBody(processSchema),
  async (req: Request, res: Response) => {
    try {
      const { filename, ...options } = req.body;
      const processedFilename = await imageService.processImage(filename, options);
      
      res.json({ 
        filename: processedFilename,
        url: `/api/images/file/${processedFilename}`,
      });
    } catch (error) {
      console.error('Image processing failed:', error);
      res.status(500).json({ 
        error: 'Failed to process image',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

const removeBackgroundSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
});

router.post(
  '/remove-background',
  validateBody(removeBackgroundSchema),
  async (req: Request, res: Response) => {
    try {
      const processedFilename = await imageService.removeBackground(req.body.filename);
      
      res.json({ 
        filename: processedFilename,
        url: `/api/images/file/${processedFilename}`,
      });
    } catch (error) {
      console.error('Background removal failed:', error);
      res.status(500).json({ 
        error: 'Failed to remove background',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

const compressSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  maxSizeMB: z.number().min(1).max(100).optional(),
});

router.post(
  '/compress',
  validateBody(compressSchema),
  async (req: Request, res: Response) => {
    try {
      const { filename, maxSizeMB } = req.body;
      const compressedFilename = await imageService.compressIfLarge(filename, maxSizeMB);
      
      res.json({ 
        filename: compressedFilename,
        url: `/api/images/file/${compressedFilename}`,
        compressed: compressedFilename !== filename,
      });
    } catch (error) {
      console.error('Image compression failed:', error);
      res.status(500).json({ 
        error: 'Failed to compress image',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

router.get('/file/:filename', async (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(process.cwd(), 'data', 'images', filename);

    await fs.access(filepath);
    
    res.sendFile(filepath);
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
});

router.post('/upload', async (req: Request, res: Response) => {
  try {
    if (!req.body.image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const filename = `upload_${Date.now()}.png`;
    const filepath = path.join(process.cwd(), 'data', 'images', filename);

    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, buffer);

    const compressedFilename = await imageService.compressIfLarge(filename);

    res.json({ 
      filename: compressedFilename,
      url: `/api/images/file/${compressedFilename}`,
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({ 
      error: 'Failed to upload image',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
