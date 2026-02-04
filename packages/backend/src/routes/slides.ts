import { Router } from 'express';
import { z } from 'zod';
import { SlideModel } from '../models/Slide';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

const createSlideSchema = z.object({
  presentationId: z.string().min(1, 'Presentation ID is required'),
  order: z.number().int().min(0).optional(),
  background: z.object({
    type: z.enum(['color', 'gradient', 'image']),
    color: z.string().optional(),
    gradient: z.object({
      type: z.enum(['linear', 'radial']),
      colors: z.array(z.string()),
      angle: z.number().optional()
    }).optional(),
    image: z.object({
      url: z.string(),
      size: z.enum(['cover', 'contain', 'auto']),
      position: z.string()
    }).optional()
  }).optional(),
  notes: z.string().optional()
});

const updateSlideSchema = z.object({
  order: z.number().int().min(0).optional(),
  elements: z.array(z.any()).optional(),
  animations: z.array(z.any()).optional(),
  background: z.object({
    type: z.enum(['color', 'gradient', 'image']),
    color: z.string().optional(),
    gradient: z.object({
      type: z.enum(['linear', 'radial']),
      colors: z.array(z.string()),
      angle: z.number().optional()
    }).optional(),
    image: z.object({
      url: z.string(),
      size: z.enum(['cover', 'contain', 'auto']),
      position: z.string()
    }).optional()
  }).optional(),
  notes: z.string().optional()
});

const reorderSlidesSchema = z.object({
  presentationId: z.string().min(1),
  slides: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0)
  }))
});

const idParamSchema = z.object({
  id: z.string().min(1)
});

router.get('/presentation/:presentationId', validateParams(z.object({ presentationId: z.string().min(1) })), asyncHandler(async (req, res) => {
  const slides = SlideModel.findByPresentationId(req.params.presentationId);
  res.json(slides);
}));

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req, res) => {
  const slide = SlideModel.findById(req.params.id);

  if (!slide) {
    throw new AppError(404, 'Slide not found');
  }

  res.json(slide);
}));

router.post('/', validateBody(createSlideSchema), asyncHandler(async (req, res) => {
  const slide = SlideModel.create(req.body);
  res.status(201).json(slide);
}));

router.put('/:id', validateParams(idParamSchema), validateBody(updateSlideSchema), asyncHandler(async (req, res) => {
  const slide = SlideModel.update(req.params.id, req.body);

  if (!slide) {
    throw new AppError(404, 'Slide not found');
  }

  res.json(slide);
}));

router.delete('/:id', validateParams(idParamSchema), asyncHandler(async (req, res) => {
  const deleted = SlideModel.delete(req.params.id);

  if (!deleted) {
    throw new AppError(404, 'Slide not found');
  }

  res.status(204).send();
}));

router.post('/reorder', validateBody(reorderSlidesSchema), asyncHandler(async (req, res) => {
  const success = SlideModel.reorder(req.body.presentationId, req.body.slides);

  if (!success) {
    throw new AppError(500, 'Failed to reorder slides');
  }

  res.json({ success: true });
}));

export default router;
