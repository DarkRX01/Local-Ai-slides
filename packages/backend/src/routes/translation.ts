import { Router } from 'express';
import { translationService } from '../services/translationService';
import { asyncHandler } from '../middleware/errorHandler';
import { body, param, validationResult } from 'express-validator';

const router = Router();

router.get(
  '/languages',
  asyncHandler(async (req, res) => {
    const languages = await translationService.getAvailableLanguages();
    res.json({ languages });
  })
);

router.post(
  '/detect',
  [
    body('text').isString().notEmpty().withMessage('Text is required'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text } = req.body;
    const result = await translationService.detectLanguage(text);
    res.json(result);
  })
);

router.post(
  '/translate',
  [
    body('text').isString().notEmpty().withMessage('Text is required'),
    body('targetLanguage').isString().notEmpty().withMessage('Target language is required'),
    body('sourceLanguage').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, targetLanguage, sourceLanguage } = req.body;
    const translatedText = await translationService.translate(
      text,
      targetLanguage,
      sourceLanguage
    );
    
    res.json({ 
      translatedText,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage 
    });
  })
);

router.post(
  '/translate/batch',
  [
    body('texts').isArray().notEmpty().withMessage('Texts array is required'),
    body('texts.*').isString().notEmpty(),
    body('targetLanguage').isString().notEmpty().withMessage('Target language is required'),
    body('sourceLanguage').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { texts, targetLanguage, sourceLanguage } = req.body;
    const translations = await translationService.translateBatch(
      texts,
      targetLanguage,
      sourceLanguage
    );
    
    res.json({ 
      translations,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage 
    });
  })
);

router.post(
  '/translate/slide/:slideId',
  [
    param('slideId').isString().notEmpty().withMessage('Slide ID is required'),
    body('targetLanguage').isString().notEmpty().withMessage('Target language is required'),
    body('sourceLanguage').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slideId } = req.params;
    const { targetLanguage, sourceLanguage } = req.body;
    
    const translatedSlide = await translationService.translateSlide(
      slideId,
      targetLanguage,
      sourceLanguage
    );
    
    res.json({ 
      slide: translatedSlide,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage 
    });
  })
);

router.post(
  '/translate/presentation/:presentationId',
  [
    param('presentationId').isString().notEmpty().withMessage('Presentation ID is required'),
    body('targetLanguage').isString().notEmpty().withMessage('Target language is required'),
    body('sourceLanguage').optional().isString(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { presentationId } = req.params;
    const { targetLanguage, sourceLanguage } = req.body;
    
    const result = await translationService.translatePresentation(
      presentationId,
      targetLanguage,
      sourceLanguage
    );
    
    res.json({ 
      ...result,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage 
    });
  })
);

router.delete(
  '/cache',
  asyncHandler(async (req, res) => {
    await translationService.clearCache();
    res.json({ message: 'Translation cache cleared successfully' });
  })
);

router.delete(
  '/cache/expired',
  asyncHandler(async (req, res) => {
    await translationService.clearExpiredCache();
    res.json({ message: 'Expired translation cache entries cleared successfully' });
  })
);

export default router;
