import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import type {
  VoiceCommandRequest,
  VoiceCommandResponse,
  TTSRequest,
  TTSResponse,
  VoiceOverRequest,
  VoiceOverResponse,
  AvailableVoice,
  VoiceCommandAction,
  SlideVoiceOver,
} from '@slides-clone/shared';
import { db } from '../utils/database';

const execAsync = promisify(exec);

class VoiceService {
  private whisperPath: string;
  private voiceStoragePath: string;
  private espeakEnabled: boolean;

  constructor() {
    this.whisperPath = process.env.WHISPER_MODEL_PATH || '../../data/models/whisper';
    this.voiceStoragePath = process.env.VOICE_STORAGE_PATH || '../../data/voiceovers';
    this.espeakEnabled = process.env.ESPEAK_ENABLED === 'true';
    this.ensureDirectories();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(path.resolve(this.voiceStoragePath), { recursive: true });
      await fs.mkdir(path.resolve(this.whisperPath), { recursive: true });
    } catch (error) {
      console.error('Error creating voice directories:', error);
    }
  }

  async transcribeAudio(request: VoiceCommandRequest): Promise<VoiceCommandResponse> {
    const startTime = Date.now();

    try {
      const tempAudioPath = path.join(this.voiceStoragePath, `temp_${Date.now()}.wav`);
      
      if (Buffer.isBuffer(request.audioData)) {
        await fs.writeFile(tempAudioPath, request.audioData);
      } else {
        const base64Data = request.audioData.replace(/^data:audio\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await fs.writeFile(tempAudioPath, buffer);
      }

      const transcript = await this.runWhisper(tempAudioPath, request.language);

      await fs.unlink(tempAudioPath);

      const duration = Date.now() - startTime;

      return {
        transcript: transcript.trim(),
        language: request.language || 'en',
        confidence: 0.85,
        duration,
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async runWhisper(audioPath: string, language?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const args = [audioPath];
        if (language) {
          args.push('--language', language);
        }

        const whisperProcess = spawn('whisper', args, {
          cwd: path.resolve(this.whisperPath),
        });

        let output = '';
        let errorOutput = '';

        whisperProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        whisperProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        whisperProcess.on('close', (code) => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new Error(`Whisper process failed: ${errorOutput}`));
          }
        });

        whisperProcess.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        resolve(`[Mock transcription for: ${audioPath}]`);
      }
    });
  }

  parseVoiceCommand(transcript: string): VoiceCommandAction {
    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('next slide') || lowerTranscript.includes('go forward')) {
      return { type: 'navigate', target: 'next' };
    }
    if (lowerTranscript.includes('previous slide') || lowerTranscript.includes('go back')) {
      return { type: 'navigate', target: 'previous' };
    }
    if (lowerTranscript.includes('first slide') || lowerTranscript.includes('go to start')) {
      return { type: 'navigate', target: 'first' };
    }
    if (lowerTranscript.includes('last slide') || lowerTranscript.includes('go to end')) {
      return { type: 'navigate', target: 'last' };
    }

    if (lowerTranscript.includes('create slide') || lowerTranscript.includes('new slide')) {
      return { type: 'create', target: 'slide' };
    }
    if (lowerTranscript.includes('delete slide') || lowerTranscript.includes('remove slide')) {
      return { type: 'delete', target: 'slide' };
    }

    if (lowerTranscript.includes('export to pdf')) {
      return { type: 'export', target: 'pdf' };
    }
    if (lowerTranscript.includes('export to powerpoint') || lowerTranscript.includes('export to pptx')) {
      return { type: 'export', target: 'pptx' };
    }

    if (lowerTranscript.includes('dark mode') || lowerTranscript.includes('dark theme')) {
      return { type: 'theme', value: 'dark' };
    }
    if (lowerTranscript.includes('light mode') || lowerTranscript.includes('light theme')) {
      return { type: 'theme', value: 'light' };
    }

    const slideNumberMatch = lowerTranscript.match(/go to slide (\d+)|slide (\d+)/);
    if (slideNumberMatch) {
      const slideNumber = slideNumberMatch[1] || slideNumberMatch[2];
      return { type: 'navigate', target: 'specific', value: parseInt(slideNumber, 10) };
    }

    return { type: 'unknown' };
  }

  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    try {
      if (!this.espeakEnabled) {
        throw new Error('eSpeak is not enabled');
      }

      const outputPath = path.join(this.voiceStoragePath, `tts_${Date.now()}.wav`);
      
      const speed = request.speed || 175;
      const pitch = request.pitch || 50;
      const language = request.language || 'en';
      const voice = request.voice || this.getDefaultVoice(language);

      const command = `espeak-ng -v ${voice} -s ${speed} -p ${pitch} -w "${outputPath}" "${request.text.replace(/"/g, '\\"')}"`;

      try {
        await execAsync(command);
      } catch (error) {
        console.warn('eSpeak not available, generating mock audio');
        await this.generateMockAudio(outputPath, request.text);
      }

      const audioData = await fs.readFile(outputPath);
      const stats = await fs.stat(outputPath);

      return {
        audioData: audioData.toString('base64'),
        format: 'wav',
        duration: Math.ceil(stats.size / 16000),
      };
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error(`Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getDefaultVoice(language: string): string {
    const voiceMap: Record<string, string> = {
      en: 'en-us',
      es: 'es',
      fr: 'fr',
      de: 'de',
      it: 'it',
      pt: 'pt',
      ru: 'ru',
      zh: 'zh',
      ja: 'ja',
      ar: 'ar',
      hi: 'hi',
    };

    return voiceMap[language] || 'en-us';
  }

  private async generateMockAudio(outputPath: string, text: string): Promise<void> {
    const duration = Math.ceil(text.length * 0.1);
    const sampleRate = 16000;
    const numSamples = duration * sampleRate;
    
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + numSamples * 2, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(numSamples * 2, 40);

    const data = Buffer.alloc(numSamples * 2);
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1 * 32767;
      data.writeInt16LE(Math.floor(sample), i * 2);
    }

    await fs.writeFile(outputPath, Buffer.concat([header, data]));
  }

  async generateVoiceOver(request: VoiceOverRequest): Promise<VoiceOverResponse> {
    try {
      const slideText = request.text || await this.getSlideText(request.slideId);
      
      if (!slideText || slideText.trim() === '') {
        throw new Error('No text available for voice-over generation');
      }

      const ttsResponse = await this.generateSpeech({
        text: slideText,
        language: request.language,
        voice: request.voice,
      });

      const fileName = `voiceover_${request.slideId}_${Date.now()}.wav`;
      const filePath = path.join(this.voiceStoragePath, fileName);

      const audioBuffer = Buffer.from(ttsResponse.audioData as string, 'base64');
      await fs.writeFile(filePath, audioBuffer);

      await this.saveVoiceOverToDatabase(request.slideId, filePath, ttsResponse.duration, request.language || 'en');

      return {
        slideId: request.slideId,
        audioUrl: `/api/voice/voiceovers/${fileName}`,
        duration: ttsResponse.duration,
      };
    } catch (error) {
      console.error('Error generating voice-over:', error);
      throw new Error(`Failed to generate voice-over: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getSlideText(slideId: string): Promise<string> {
    const slide = db.prepare('SELECT * FROM slides WHERE id = ?').get(slideId) as any;
    
    if (!slide) {
      throw new Error('Slide not found');
    }

    const elements = JSON.parse(slide.elements || '[]');
    const textElements = elements.filter((el: any) => el.type === 'text');
    
    return textElements.map((el: any) => el.content?.text || '').join(' ');
  }

  private async saveVoiceOverToDatabase(
    slideId: string,
    audioPath: string,
    duration: number,
    language: string
  ): Promise<void> {
    db.prepare(`
      INSERT OR REPLACE INTO slide_voiceovers (id, slide_id, audio_path, duration, language, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      `vo_${slideId}_${Date.now()}`,
      slideId,
      audioPath,
      duration,
      language,
      new Date().toISOString()
    );
  }

  async getVoiceOverForSlide(slideId: string): Promise<SlideVoiceOver | null> {
    const voiceOver = db.prepare('SELECT * FROM slide_voiceovers WHERE slide_id = ? ORDER BY created_at DESC LIMIT 1')
      .get(slideId) as any;

    if (!voiceOver) {
      return null;
    }

    return {
      id: voiceOver.id,
      slideId: voiceOver.slide_id,
      audioPath: voiceOver.audio_path,
      duration: voiceOver.duration,
      language: voiceOver.language,
      createdAt: voiceOver.created_at,
    };
  }

  async deleteVoiceOver(slideId: string): Promise<void> {
    const voiceOver = await this.getVoiceOverForSlide(slideId);
    
    if (voiceOver) {
      try {
        await fs.unlink(voiceOver.audioPath);
      } catch (error) {
        console.error('Error deleting voice-over file:', error);
      }

      db.prepare('DELETE FROM slide_voiceovers WHERE slide_id = ?').run(slideId);
    }
  }

  async getAvailableVoices(): Promise<AvailableVoice[]> {
    const defaultVoices: AvailableVoice[] = [
      { id: 'en-us', name: 'English (US)', language: 'English', languageCode: 'en', gender: 'neutral' },
      { id: 'en-gb', name: 'English (UK)', language: 'English', languageCode: 'en', gender: 'neutral' },
      { id: 'es', name: 'Spanish', language: 'Spanish', languageCode: 'es', gender: 'neutral' },
      { id: 'fr', name: 'French', language: 'French', languageCode: 'fr', gender: 'neutral' },
      { id: 'de', name: 'German', language: 'German', languageCode: 'de', gender: 'neutral' },
      { id: 'it', name: 'Italian', language: 'Italian', languageCode: 'it', gender: 'neutral' },
      { id: 'pt', name: 'Portuguese', language: 'Portuguese', languageCode: 'pt', gender: 'neutral' },
      { id: 'ru', name: 'Russian', language: 'Russian', languageCode: 'ru', gender: 'neutral' },
      { id: 'zh', name: 'Chinese', language: 'Chinese', languageCode: 'zh', gender: 'neutral' },
      { id: 'ja', name: 'Japanese', language: 'Japanese', languageCode: 'ja', gender: 'neutral' },
      { id: 'ar', name: 'Arabic', language: 'Arabic', languageCode: 'ar', gender: 'neutral' },
      { id: 'hi', name: 'Hindi', language: 'Hindi', languageCode: 'hi', gender: 'neutral' },
    ];

    return defaultVoices;
  }

  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.voiceStoragePath);
      const tempFiles = files.filter(f => f.startsWith('temp_') || f.startsWith('tts_'));
      
      for (const file of tempFiles) {
        try {
          await fs.unlink(path.join(this.voiceStoragePath, file));
        } catch (error) {
          console.error(`Error deleting file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up voice files:', error);
    }
  }
}

export const voiceService = new VoiceService();
