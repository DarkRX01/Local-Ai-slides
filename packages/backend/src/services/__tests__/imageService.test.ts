import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { imageService } from '../imageService';

vi.mock('axios');
vi.mock('sharp');
vi.mock('puppeteer');
vi.mock('fs/promises');

const mockedAxios = axios as any;

describe('ImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await imageService.cleanup();
  });

  describe('checkSDAvailability', () => {
    it('should return true when Stable Diffusion is available', async () => {
      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockResolvedValue({ status: 200 }),
      });

      const result = await imageService.checkSDAvailability();
      expect(result).toBe(true);
    });

    it('should return false when Stable Diffusion is not available', async () => {
      mockedAxios.create.mockReturnValue({
        get: vi.fn().mockRejectedValue(new Error('Connection failed')),
      });

      const result = await imageService.checkSDAvailability();
      expect(result).toBe(false);
    });
  });

  describe('generateImage', () => {
    it('should create a job and return jobId', async () => {
      const jobId = await imageService.generateImage({
        prompt: 'test prompt',
      });

      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');
    });

    it('should accept optional parameters', async () => {
      const jobId = await imageService.generateImage({
        prompt: 'test prompt',
        negativePrompt: 'bad quality',
        width: 1024,
        height: 768,
        steps: 30,
        cfgScale: 8,
      });

      expect(jobId).toBeDefined();
    });
  });

  describe('getJobStatus', () => {
    it('should return job status for existing job', async () => {
      const jobId = await imageService.generateImage({
        prompt: 'test prompt',
      });

      const status = await imageService.getJobStatus(jobId);

      expect(status).toBeDefined();
      expect(status?.id).toBe(jobId);
      expect(status?.status).toBe('pending');
      expect(status?.prompt).toBe('test prompt');
    });

    it('should return null for non-existent job', async () => {
      const status = await imageService.getJobStatus('non-existent-id');
      expect(status).toBeNull();
    });
  });

  describe('searchGoogleImages', () => {
    it('should throw error if API credentials not configured', async () => {
      await expect(
        imageService.searchGoogleImages('test query')
      ).rejects.toThrow('Google API credentials not configured');
    });

    it('should return image results when configured', async () => {
      process.env.GOOGLE_API_KEY = 'test-key';
      process.env.GOOGLE_SEARCH_ENGINE_ID = 'test-id';

      mockedAxios.get = vi.fn().mockResolvedValue({
        data: {
          items: [
            {
              link: 'https://example.com/image1.jpg',
              title: 'Test Image 1',
              image: { thumbnailLink: 'https://example.com/thumb1.jpg' },
            },
          ],
        },
      });

      const results = await imageService.searchGoogleImages('test query', 5);

      expect(results).toHaveLength(1);
      expect(results[0].url).toBe('https://example.com/image1.jpg');
      expect(results[0].title).toBe('Test Image 1');
      expect(results[0].thumbnail).toBe('https://example.com/thumb1.jpg');

      delete process.env.GOOGLE_API_KEY;
      delete process.env.GOOGLE_SEARCH_ENGINE_ID;
    });

    it('should return empty array if no results', async () => {
      process.env.GOOGLE_API_KEY = 'test-key';
      process.env.GOOGLE_SEARCH_ENGINE_ID = 'test-id';

      mockedAxios.get = vi.fn().mockResolvedValue({
        data: {},
      });

      const results = await imageService.searchGoogleImages('test query');
      expect(results).toEqual([]);

      delete process.env.GOOGLE_API_KEY;
      delete process.env.GOOGLE_SEARCH_ENGINE_ID;
    });
  });

  describe('downloadImage', () => {
    it('should download and save image', async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({
        data: Buffer.from('fake-image-data'),
        headers: { 'content-type': 'image/jpeg' },
      });

      const filename = await imageService.downloadImage('https://example.com/image.jpg');

      expect(filename).toMatch(/^dl_.*\.jpg$/);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://example.com/image.jpg',
        expect.objectContaining({
          responseType: 'arraybuffer',
        })
      );
    });
  });

  describe('compressIfLarge', () => {
    it('should return original filename if image is small enough', async () => {
      const mockStats = { size: 5 * 1024 * 1024 };
      const fs = await import('fs/promises');
      (fs.stat as any) = vi.fn().mockResolvedValue(mockStats);

      const result = await imageService.compressIfLarge('test.jpg', 10);
      expect(result).toBe('test.jpg');
    });

    it('should compress if image exceeds size limit', async () => {
      const mockStats = { size: 15 * 1024 * 1024 };
      const fs = await import('fs/promises');
      (fs.stat as any) = vi.fn().mockResolvedValue(mockStats);

      const result = await imageService.compressIfLarge('test.jpg', 10);
      expect(result).toMatch(/^processed_.*\.webp$/);
    });
  });
});
