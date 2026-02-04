import axios, { AxiosInstance } from 'axios';
import sharp from 'sharp';
import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface SDGenerateOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  samplerName?: string;
  seed?: number;
}

interface SDGenerateResponse {
  images: string[];
  info: string;
}

interface GoogleImageResult {
  url: string;
  title: string;
  thumbnail: string;
}

interface ImageGenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  result?: string;
  error?: string;
  createdAt: Date;
}

class ImageService {
  private sdClient: AxiosInstance;
  private googleApiKey: string | null;
  private googleSearchEngineId: string | null;
  private imageQueue: Map<string, ImageGenerationJob>;
  private browser: Browser | null = null;
  private lastScrapeTime: number = 0;
  private scrapeRateLimit: number = 2000;
  private processingQueue: boolean = false;

  constructor() {
    this.sdClient = axios.create({
      baseURL: process.env.SD_WEBUI_URL || 'http://127.0.0.1:7860',
      timeout: 120000,
    });

    this.googleApiKey = process.env.GOOGLE_API_KEY || null;
    this.googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || null;
    this.imageQueue = new Map();
  }

  async checkSDAvailability(): Promise<boolean> {
    try {
      const response = await this.sdClient.get('/sdapi/v1/sd-models', { timeout: 5000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async generateImage(options: SDGenerateOptions): Promise<string> {
    const jobId = crypto.randomUUID();
    
    const job: ImageGenerationJob = {
      id: jobId,
      status: 'pending',
      prompt: options.prompt,
      createdAt: new Date(),
    };

    this.imageQueue.set(jobId, job);
    this.processQueue();

    return jobId;
  }

  private async processQueue(): Promise<void> {
    if (this.processingQueue) return;
    this.processingQueue = true;

    try {
      for (const [jobId, job] of this.imageQueue.entries()) {
        if (job.status === 'pending') {
          job.status = 'processing';
          
          try {
            const imageData = await this.generateWithSD(job.prompt);
            job.result = imageData;
            job.status = 'completed';
          } catch (error) {
            job.error = error instanceof Error ? error.message : 'Unknown error';
            job.status = 'failed';
          }
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  private async generateWithSD(prompt: string, options: Partial<SDGenerateOptions> = {}): Promise<string> {
    const payload = {
      prompt: prompt,
      negative_prompt: options.negativePrompt || 'low quality, blurry, distorted',
      width: options.width || 512,
      height: options.height || 512,
      steps: options.steps || 20,
      cfg_scale: options.cfgScale || 7,
      sampler_name: options.samplerName || 'Euler a',
      seed: options.seed || -1,
    };

    const response = await this.sdClient.post<SDGenerateResponse>('/sdapi/v1/txt2img', payload);
    
    if (!response.data.images || response.data.images.length === 0) {
      throw new Error('No images generated');
    }

    const base64Image = response.data.images[0];
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    const filename = `sd_${crypto.randomUUID()}.png`;
    const filepath = path.join(process.cwd(), 'data', 'images', filename);
    
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, imageBuffer);

    return filename;
  }

  async getJobStatus(jobId: string): Promise<ImageGenerationJob | null> {
    return this.imageQueue.get(jobId) || null;
  }

  async searchGoogleImages(query: string, count: number = 10): Promise<GoogleImageResult[]> {
    if (!this.googleApiKey || !this.googleSearchEngineId) {
      throw new Error('Google API credentials not configured');
    }

    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.googleApiKey,
          cx: this.googleSearchEngineId,
          q: query,
          searchType: 'image',
          num: Math.min(count, 10),
        },
      });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map((item: any) => ({
        url: item.link,
        title: item.title,
        thumbnail: item.image.thumbnailLink,
      }));
    } catch (error) {
      console.error('Google Image Search failed:', error);
      throw error;
    }
  }

  async scrapeImages(query: string, count: number = 10): Promise<GoogleImageResult[]> {
    const now = Date.now();
    if (now - this.lastScrapeTime < this.scrapeRateLimit) {
      throw new Error(`Rate limited. Please wait ${Math.ceil((this.scrapeRateLimit - (now - this.lastScrapeTime)) / 1000)}s`);
    }

    this.lastScrapeTime = now;

    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: 'new' });
    }

    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      await page.waitForSelector('img', { timeout: 10000 });

      const images = await page.evaluate((maxCount: number) => {
        const imgElements = document.querySelectorAll('img');
        const results: { url: string; title: string; thumbnail: string }[] = [];

        for (let i = 0; i < Math.min(imgElements.length, maxCount + 5); i++) {
          const img = imgElements[i];
          const src = img.src || (img as any).dataset.src;
          
          if (src && src.startsWith('http') && !src.includes('gstatic.com')) {
            results.push({
              url: src,
              title: img.alt || 'Image',
              thumbnail: src,
            });
          }

          if (results.length >= maxCount) break;
        }

        return results;
      }, count);

      return images;
    } catch (error) {
      console.error('Image scraping failed:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async downloadImage(url: string): Promise<string> {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const buffer = Buffer.from(response.data);
    const filename = `dl_${crypto.randomUUID()}.${this.getImageExtension(response.headers['content-type'])}`;
    const filepath = path.join(process.cwd(), 'data', 'images', filename);

    await fs.mkdir(path.dirname(filepath), { recursive: true });
    await fs.writeFile(filepath, buffer);

    return filename;
  }

  async processImage(
    filename: string,
    options: {
      resize?: { width?: number; height?: number };
      compress?: boolean;
      format?: 'jpeg' | 'png' | 'webp';
      quality?: number;
      filters?: {
        grayscale?: boolean;
        blur?: number;
        sharpen?: boolean;
        rotate?: number;
      };
    }
  ): Promise<string> {
    const filepath = path.join(process.cwd(), 'data', 'images', filename);
    let image = sharp(filepath);

    if (options.resize) {
      image = image.resize(options.resize.width, options.resize.height, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (options.filters) {
      if (options.filters.grayscale) {
        image = image.grayscale();
      }
      if (options.filters.blur) {
        image = image.blur(options.filters.blur);
      }
      if (options.filters.sharpen) {
        image = image.sharpen();
      }
      if (options.filters.rotate) {
        image = image.rotate(options.filters.rotate);
      }
    }

    const format = options.format || 'jpeg';
    const quality = options.quality || (options.compress ? 80 : 90);

    if (format === 'jpeg') {
      image = image.jpeg({ quality });
    } else if (format === 'png') {
      image = image.png({ quality });
    } else if (format === 'webp') {
      image = image.webp({ quality });
    }

    const processedFilename = `processed_${crypto.randomUUID()}.${format}`;
    const processedFilepath = path.join(process.cwd(), 'data', 'images', processedFilename);

    await image.toFile(processedFilepath);

    return processedFilename;
  }

  async removeBackground(filename: string): Promise<string> {
    const filepath = path.join(process.cwd(), 'data', 'images', filename);
    
    const image = sharp(filepath);
    const metadata = await image.metadata();

    if (!metadata.hasAlpha) {
      image.ensureAlpha();
    }

    const { data, info } = await image
      .raw()
      .toBuffer({ resolveWithObject: true });

    const threshold = 240;
    const pixels = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (r > threshold && g > threshold && b > threshold) {
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 0;
      } else {
        pixels[i] = r;
        pixels[i + 1] = g;
        pixels[i + 2] = b;
        pixels[i + 3] = 255;
      }
    }

    const processedFilename = `nobg_${crypto.randomUUID()}.png`;
    const processedFilepath = path.join(process.cwd(), 'data', 'images', processedFilename);

    await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4,
      },
    })
      .png()
      .toFile(processedFilepath);

    return processedFilename;
  }

  async compressIfLarge(filename: string, maxSizeMB: number = 10): Promise<string> {
    const filepath = path.join(process.cwd(), 'data', 'images', filename);
    const stats = await fs.stat(filepath);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB <= maxSizeMB) {
      return filename;
    }

    console.log(`Compressing large image: ${sizeMB.toFixed(2)}MB > ${maxSizeMB}MB`);

    return this.processImage(filename, {
      compress: true,
      quality: 75,
      format: 'webp',
    });
  }

  private getImageExtension(contentType: string | undefined): string {
    if (!contentType) return 'jpg';
    
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };

    return map[contentType] || 'jpg';
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

export const imageService = new ImageService();
export default imageService;
