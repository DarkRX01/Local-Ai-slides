import axios, { AxiosInstance, AxiosError } from 'axios';
import { Presentation, Slide } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async getPresentations(): Promise<Presentation[]> {
    const response = await this.client.get<Presentation[]>('/presentations');
    return response.data;
  }

  async getPresentation(id: string): Promise<Presentation> {
    const response = await this.client.get<Presentation>(`/presentations/${id}`);
    return response.data;
  }

  async createPresentation(data: Partial<Presentation>): Promise<Presentation> {
    const response = await this.client.post<Presentation>('/presentations', data);
    return response.data;
  }

  async updatePresentation(id: string, data: Partial<Presentation>): Promise<Presentation> {
    const response = await this.client.put<Presentation>(`/presentations/${id}`, data);
    return response.data;
  }

  async deletePresentation(id: string): Promise<void> {
    await this.client.delete(`/presentations/${id}`);
  }

  async createSlide(presentationId: string, data: Partial<Slide>): Promise<Slide> {
    const response = await this.client.post<Slide>(`/presentations/${presentationId}/slides`, data);
    return response.data;
  }

  async updateSlide(presentationId: string, slideId: string, data: Partial<Slide>): Promise<Slide> {
    const response = await this.client.put<Slide>(`/presentations/${presentationId}/slides/${slideId}`, data);
    return response.data;
  }

  async deleteSlide(presentationId: string, slideId: string): Promise<void> {
    await this.client.delete(`/presentations/${presentationId}/slides/${slideId}`);
  }

  async checkAIHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get<{ status: string; timestamp: string }>('/ai/health');
    return response.data;
  }

  async listAIModels(): Promise<{ models: string[] }> {
    const response = await this.client.get<{ models: string[] }>('/ai/models');
    return response.data;
  }

  async generatePresentation(request: {
    prompt: string;
    slideCount: number;
    language?: string;
    theme?: string;
    includeImages?: boolean;
    animationLevel?: 'none' | 'basic' | 'advanced';
    options?: {
      temperature?: number;
      model?: string;
    };
  }): Promise<{
    presentationId: string;
    slides: any[];
    status: 'success' | 'partial' | 'failed';
    error?: string;
  }> {
    const response = await this.client.post('/ai/generate', request);
    return response.data;
  }

  async generateText(prompt: string, model?: string, temperature?: number): Promise<{ text: string }> {
    const response = await this.client.post<{ text: string }>('/ai/text', {
      prompt,
      model,
      temperature,
    });
    return response.data;
  }

  async enhanceSlide(slideId: string, type: 'content' | 'layout' | 'animations', context?: string): Promise<any> {
    const response = await this.client.post('/ai/enhance', {
      slideId,
      type,
      context,
    });
    return response.data;
  }

  async suggestAnimations(slideId: string, context?: string): Promise<any> {
    const response = await this.client.post(`/ai/suggest-animations/${slideId}`, { context });
    return response.data;
  }

  async streamGenerate(
    prompt: string,
    model?: string,
    temperature?: number,
    onChunk?: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${this.client.defaults.baseURL}/ai/generate/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, model, temperature }),
    });

    if (!response.ok) {
      throw new Error('Stream request failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data:'));

      for (const line of lines) {
        const data = line.replace(/^data: /, '');
        if (data === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.chunk && onChunk) {
            onChunk(parsed.chunk);
          }
        } catch (e) {
          console.error('Error parsing stream chunk:', e);
        }
      }
    }
  }

  async checkImageServiceHealth(): Promise<{ stableDiffusion: boolean; googleSearch: boolean }> {
    const response = await this.client.get<{ stableDiffusion: boolean; googleSearch: boolean }>('/images/health');
    return response.data;
  }

  async generateImage(options: {
    prompt: string;
    negativePrompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    cfgScale?: number;
  }): Promise<{ jobId: string }> {
    const response = await this.client.post<{ jobId: string }>('/images/generate', options);
    return response.data;
  }

  async getImageGenerationStatus(jobId: string): Promise<{
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    prompt: string;
    result?: string;
    error?: string;
  }> {
    const response = await this.client.get(`/images/job/${jobId}`);
    return response.data;
  }

  async searchGoogleImages(query: string, count: number = 10): Promise<Array<{ url: string; thumbnail: string; title: string }>> {
    const response = await this.client.get<{ results: Array<{ url: string; thumbnail: string; title: string }> }>(
      '/images/search/google',
      {
        params: { q: query, count },
      }
    );
    return response.data.results;
  }

  async scrapeImages(query: string, count: number = 10): Promise<Array<{ url: string; thumbnail: string; title: string }>> {
    const response = await this.client.get<{ results: Array<{ url: string; thumbnail: string; title: string }> }>(
      '/images/search/scrape',
      {
        params: { q: query, count },
      }
    );
    return response.data.results;
  }

  async downloadImage(url: string): Promise<{ filename: string; url: string }> {
    const response = await this.client.post<{ filename: string; url: string }>('/images/download', { url });
    return response.data;
  }

  async processImage(filename: string, options: any): Promise<{ filename: string; url: string }> {
    const response = await this.client.post<{ filename: string; url: string }>('/images/process', {
      filename,
      ...options,
    });
    return response.data;
  }

  async removeImageBackground(filename: string): Promise<{ filename: string; url: string }> {
    const response = await this.client.post<{ filename: string; url: string }>('/images/remove-background', { filename });
    return response.data;
  }

  async compressImage(filename: string, maxSizeMB?: number): Promise<{ filename: string; url: string; compressed: boolean }> {
    const response = await this.client.post<{ filename: string; url: string; compressed: boolean }>('/images/compress', {
      filename,
      maxSizeMB,
    });
    return response.data;
  }

  async uploadImage(base64Image: string): Promise<{ filename: string; url: string }> {
    const response = await this.client.post<{ filename: string; url: string }>('/images/upload', {
      image: base64Image,
    });
    return response.data;
  }

  async getAvailableLanguages(): Promise<Array<{ code: string; name: string; targets?: string[] }>> {
    const response = await this.client.get<{ languages: Array<{ code: string; name: string; targets?: string[] }> }>('/translation/languages');
    return response.data.languages;
  }

  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    const response = await this.client.post<{ language: string; confidence: number }>('/translation/detect', { text });
    return response.data;
  }

  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{ translatedText: string; sourceLanguage: string; targetLanguage: string }> {
    const response = await this.client.post<{ translatedText: string; sourceLanguage: string; targetLanguage: string }>(
      '/translation/translate',
      {
        text,
        targetLanguage,
        sourceLanguage,
      }
    );
    return response.data;
  }

  async translateBatch(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{ translations: string[]; sourceLanguage: string; targetLanguage: string }> {
    const response = await this.client.post<{ translations: string[]; sourceLanguage: string; targetLanguage: string }>(
      '/translation/translate/batch',
      {
        texts,
        targetLanguage,
        sourceLanguage,
      }
    );
    return response.data;
  }

  async translateSlide(
    slideId: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{ slide: any; sourceLanguage: string; targetLanguage: string }> {
    const response = await this.client.post<{ slide: any; sourceLanguage: string; targetLanguage: string }>(
      `/translation/translate/slide/${slideId}`,
      {
        targetLanguage,
        sourceLanguage,
      }
    );
    return response.data;
  }

  async translatePresentation(
    presentationId: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{ presentationId: string; slidesTranslated: number; sourceLanguage: string; targetLanguage: string }> {
    const response = await this.client.post<{
      presentationId: string;
      slidesTranslated: number;
      sourceLanguage: string;
      targetLanguage: string;
    }>(`/translation/translate/presentation/${presentationId}`, {
      targetLanguage,
      sourceLanguage,
    });
    return response.data;
  }

  async clearTranslationCache(): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>('/translation/cache');
    return response.data;
  }

  async exportPresentation(
    presentationId: string,
    config: {
      format: 'pdf' | 'pptx' | 'html' | 'video';
      options?: {
        quality?: 'low' | 'medium' | 'high';
        includeNotes?: boolean;
        slideRange?: [number, number];
        videoFps?: number;
        videoCodec?: string;
      };
    }
  ): Promise<{
    id: string;
    presentationId: string;
    format: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    filePath?: string;
    error?: string;
    createdAt: string;
    completedAt?: string;
  }> {
    const response = await this.client.post(`/export/${config.format}`, {
      presentationId,
      config,
    });
    return response.data;
  }

  async getExportStatus(jobId: string): Promise<{
    id: string;
    presentationId: string;
    format: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    filePath?: string;
    error?: string;
    createdAt: string;
    completedAt?: string;
  }> {
    const response = await this.client.get(`/export/status/${jobId}`);
    return response.data;
  }

  async getAllExportJobs(): Promise<Array<{
    id: string;
    presentationId: string;
    format: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    filePath?: string;
    error?: string;
    createdAt: string;
    completedAt?: string;
  }>> {
    const response = await this.client.get('/export/jobs');
    return response.data;
  }

  async downloadExport(jobId: string): Promise<Blob> {
    const response = await this.client.get(`/export/download/${jobId}`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteExportJob(jobId: string): Promise<void> {
    await this.client.delete(`/export/jobs/${jobId}`);
  }

  async transcribeAudio(audioData: string | Blob, language?: string): Promise<{
    transcript: string;
    language: string;
    confidence: number;
    duration: number;
  }> {
    const formData = new FormData();
    
    if (audioData instanceof Blob) {
      formData.append('audio', audioData);
    } else {
      formData.append('audioData', audioData);
    }
    
    if (language) {
      formData.append('language', language);
    }

    const response = await this.client.post('/voice/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async parseVoiceCommand(transcript: string): Promise<{
    transcript: string;
    action: any;
    timestamp: string;
  }> {
    const response = await this.client.post('/voice/command', { transcript });
    return response.data;
  }

  async generateSpeech(options: {
    text: string;
    language?: string;
    voice?: string;
    speed?: number;
    pitch?: number;
  }): Promise<{
    audioData: string;
    format: 'wav' | 'mp3';
    duration: number;
  }> {
    const response = await this.client.post('/voice/tts', options);
    return response.data;
  }

  async generateVoiceOver(options: {
    slideId: string;
    text?: string;
    language?: string;
    voice?: string;
  }): Promise<{
    slideId: string;
    audioUrl: string;
    duration: number;
  }> {
    const response = await this.client.post('/voice/voiceover', options);
    return response.data;
  }

  async getVoiceOver(slideId: string): Promise<{
    id: string;
    slideId: string;
    audioPath: string;
    duration: number;
    language: string;
    createdAt: string;
  } | null> {
    try {
      const response = await this.client.get(`/voice/voiceover/${slideId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async deleteVoiceOver(slideId: string): Promise<void> {
    await this.client.delete(`/voice/voiceover/${slideId}`);
  }

  async getAvailableVoices(): Promise<Array<{
    id: string;
    name: string;
    language: string;
    languageCode: string;
    gender?: 'male' | 'female' | 'neutral';
  }>> {
    const response = await this.client.get('/voice/voices');
    return response.data;
  }

  async cleanupVoiceFiles(): Promise<void> {
    await this.client.post('/voice/cleanup');
  }
}

export const api = new ApiClient();
export default api;
