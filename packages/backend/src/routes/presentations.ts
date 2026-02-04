import { Router } from 'express';
import { z } from 'zod';
import { PresentationModel } from '../models/Presentation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

const createPresentationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  theme: z.object({
    colors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional()
    }).optional(),
    fonts: z.object({
      heading: z.string().optional(),
      body: z.string().optional()
    }).optional(),
    mode: z.enum(['light', 'dark']).optional()
  }).optional(),
  settings: z.object({
    slideSize: z.object({
      width: z.number().optional(),
      height: z.number().optional()
    }).optional(),
    aspectRatio: z.enum(['16:9', '4:3', 'custom']).optional(),
    autoSave: z.boolean().optional(),
    autoSaveInterval: z.number().optional()
  }).optional()
});

const updatePresentationSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  theme: z.object({
    colors: z.object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      text: z.string().optional()
    }).optional(),
    fonts: z.object({
      heading: z.string().optional(),
      body: z.string().optional()
    }).optional(),
    mode: z.enum(['light', 'dark']).optional()
  }).optional(),
  settings: z.object({
    slideSize: z.object({
      width: z.number().optional(),
      height: z.number().optional()
    }).optional(),
    aspectRatio: z.enum(['16:9', '4:3', 'custom']).optional(),
    autoSave: z.boolean().optional(),
    autoSaveInterval: z.number().optional()
  }).optional()
});

const idParamSchema = z.object({
  id: z.string().min(1)
});

router.get('/', asyncHandler(async (_req, res) => {
  const presentations = PresentationModel.findAll();
  res.json(presentations);
}));

router.get('/:id', validateParams(idParamSchema), asyncHandler(async (req, res) => {
  const presentation = PresentationModel.findById(req.params.id);

  if (!presentation) {
    throw new AppError(404, 'Presentation not found');
  }

  res.json(presentation);
}));

router.post('/', validateBody(createPresentationSchema), asyncHandler(async (req, res) => {
  const presentation = PresentationModel.create(req.body);
  res.status(201).json(presentation);
}));

router.put('/:id', validateParams(idParamSchema), validateBody(updatePresentationSchema), asyncHandler(async (req, res) => {
  const presentation = PresentationModel.update(req.params.id, req.body);

  if (!presentation) {
    throw new AppError(404, 'Presentation not found');
  }

  res.json(presentation);
}));

router.delete('/:id', validateParams(idParamSchema), asyncHandler(async (req, res) => {
  const deleted = PresentationModel.delete(req.params.id);

  if (!deleted) {
    throw new AppError(404, 'Presentation not found');
  }

  res.status(204).send();
}));

export default router;
