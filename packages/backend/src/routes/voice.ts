import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { voiceService } from '../services/voiceService';
import type {
  VoiceCommandRequest,
  TTSRequest,
  VoiceOverRequest,
} from '@slides-clone/shared';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file && !req.body.audioData) {
      return res.status(400).json({ error: 'No audio data provided' });
    }

    const request: VoiceCommandRequest = {
      audioData: req.file ? req.file.buffer : req.body.audioData,
      language: req.body.language,
      model: req.body.model,
    };

    const response = await voiceService.transcribeAudio(request);
    
    res.json(response);
  } catch (error) {
    console.error('Error in transcribe endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to transcribe audio' 
    });
  }
});

router.post('/command', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }

    const action = voiceService.parseVoiceCommand(transcript);
    
    res.json({
      transcript,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in command endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to parse command' 
    });
  }
});

router.post('/tts', async (req, res) => {
  try {
    const request: TTSRequest = {
      text: req.body.text,
      language: req.body.language,
      voice: req.body.voice,
      speed: req.body.speed,
      pitch: req.body.pitch,
    };

    if (!request.text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const response = await voiceService.generateSpeech(request);
    
    res.json(response);
  } catch (error) {
    console.error('Error in TTS endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate speech' 
    });
  }
});

router.post('/voiceover', async (req, res) => {
  try {
    const request: VoiceOverRequest = {
      slideId: req.body.slideId,
      text: req.body.text,
      language: req.body.language,
      voice: req.body.voice,
    };

    if (!request.slideId) {
      return res.status(400).json({ error: 'No slide ID provided' });
    }

    const response = await voiceService.generateVoiceOver(request);
    
    res.json(response);
  } catch (error) {
    console.error('Error in voiceover endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate voice-over' 
    });
  }
});

router.get('/voiceover/:slideId', async (req, res) => {
  try {
    const { slideId } = req.params;

    const voiceOver = await voiceService.getVoiceOverForSlide(slideId);
    
    if (!voiceOver) {
      return res.status(404).json({ error: 'Voice-over not found' });
    }

    res.json(voiceOver);
  } catch (error) {
    console.error('Error in get voiceover endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to retrieve voice-over' 
    });
  }
});

router.delete('/voiceover/:slideId', async (req, res) => {
  try {
    const { slideId } = req.params;

    await voiceService.deleteVoiceOver(slideId);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in delete voiceover endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete voice-over' 
    });
  }
});

router.get('/voiceovers/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const voiceStoragePath = process.env.VOICE_STORAGE_PATH || '../../data/voiceovers';
    const filePath = path.join(path.resolve(voiceStoragePath), filename);

    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    
    if (!fileExists) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving voice-over file:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to serve audio file' 
    });
  }
});

router.get('/voices', async (req, res) => {
  try {
    const voices = await voiceService.getAvailableVoices();
    
    res.json(voices);
  } catch (error) {
    console.error('Error in voices endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to retrieve available voices' 
    });
  }
});

router.post('/cleanup', async (req, res) => {
  try {
    await voiceService.cleanup();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to cleanup voice files' 
    });
  }
});

export default router;
