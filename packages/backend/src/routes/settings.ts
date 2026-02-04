import { Router } from 'express';
import { z } from 'zod';
import { SettingsModel } from '../models/Settings';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validation';

const router = Router();

const updateSettingsSchema = z.object({
  passwordProtection: z.boolean().optional(),
  password: z.string().optional(),
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  autoSave: z.boolean().optional(),
  autoSaveInterval: z.number().int().min(1000).optional(),
  exportQuality: z.enum(['draft', 'standard', 'hd']).optional(),
  aiModel: z.string().optional()
});

router.get('/', asyncHandler(async (_req, res) => {
  const settings = SettingsModel.get();

  if (!settings) {
    throw new AppError(404, 'Settings not found');
  }

  res.json(settings);
}));

router.put('/', validateBody(updateSettingsSchema), asyncHandler(async (req, res) => {
  const settings = SettingsModel.update(req.body);

  if (!settings) {
    throw new AppError(404, 'Settings not found');
  }

  res.json(settings);
}));

export default router;
