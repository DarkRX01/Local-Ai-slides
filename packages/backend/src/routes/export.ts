import { Router } from 'express';
import { z } from 'zod';
import { exportService } from '../services/exportService';
import { PresentationModel } from '../models/Presentation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody, validateParams } from '../middleware/validation';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

const exportConfigSchema = z.object({
  format: z.enum(['pdf', 'pptx', 'html', 'video']),
  options: z.object({
    quality: z.enum(['low', 'medium', 'high']).optional(),
    includeNotes: z.boolean().optional(),
    slideRange: z.tuple([z.number(), z.number()]).optional(),
    videoFps: z.number().min(10).max(60).optional(),
    videoCodec: z.string().optional(),
  }).optional().default({}),
});

const idParamSchema = z.object({
  id: z.string().min(1),
});

const exportRequestSchema = z.object({
  presentationId: z.string().min(1),
  config: exportConfigSchema,
});

router.post(
  '/pdf',
  validateBody(exportRequestSchema),
  asyncHandler(async (req, res) => {
    const { presentationId, config } = req.body;
    
    const presentation = PresentationModel.findById(presentationId);
    if (!presentation) {
      throw new AppError(404, 'Presentation not found');
    }

    const job = await exportService.exportPDF(presentation, config);
    res.status(202).json(job);
  })
);

router.post(
  '/pptx',
  validateBody(exportRequestSchema),
  asyncHandler(async (req, res) => {
    const { presentationId, config } = req.body;
    
    const presentation = PresentationModel.findById(presentationId);
    if (!presentation) {
      throw new AppError(404, 'Presentation not found');
    }

    const job = await exportService.exportPPTX(presentation, config);
    res.status(202).json(job);
  })
);

router.post(
  '/html',
  validateBody(exportRequestSchema),
  asyncHandler(async (req, res) => {
    const { presentationId, config } = req.body;
    
    const presentation = PresentationModel.findById(presentationId);
    if (!presentation) {
      throw new AppError(404, 'Presentation not found');
    }

    const job = await exportService.exportHTML(presentation, config);
    res.status(202).json(job);
  })
);

router.post(
  '/video',
  validateBody(exportRequestSchema),
  asyncHandler(async (req, res) => {
    const { presentationId, config } = req.body;
    
    const presentation = PresentationModel.findById(presentationId);
    if (!presentation) {
      throw new AppError(404, 'Presentation not found');
    }

    const job = await exportService.exportVideo(presentation, config);
    res.status(202).json(job);
  })
);

router.get(
  '/status/:jobId',
  validateParams(idParamSchema.extend({ jobId: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    
    const job = exportService.getJob(jobId);
    if (!job) {
      throw new AppError(404, 'Export job not found');
    }

    res.json(job);
  })
);

router.get(
  '/jobs',
  asyncHandler(async (_req, res) => {
    const jobs = exportService.getAllJobs();
    res.json(jobs);
  })
);

router.get(
  '/download/:jobId',
  validateParams(idParamSchema.extend({ jobId: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    
    const job = exportService.getJob(jobId);
    if (!job) {
      throw new AppError(404, 'Export job not found');
    }

    if (job.status !== 'completed' || !job.filePath) {
      throw new AppError(400, 'Export is not completed or file not available');
    }

    try {
      await fs.access(job.filePath);
    } catch {
      throw new AppError(404, 'Export file not found');
    }

    const fileName = path.basename(job.filePath);
    res.download(job.filePath, fileName);
  })
);

router.delete(
  '/jobs/:jobId',
  validateParams(idParamSchema.extend({ jobId: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    
    const deleted = exportService.deleteJob(jobId);
    if (!deleted) {
      throw new AppError(404, 'Export job not found');
    }

    res.status(204).send();
  })
);

export default router;
