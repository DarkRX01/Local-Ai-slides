import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from '../exportService';
import type { Presentation, ExportConfig } from '@slides-clone/shared';

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    addImage: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    output: vi.fn(() => new ArrayBuffer(100)),
  })),
}));

vi.mock('html-to-image', () => ({
  default: {
    toPng: vi.fn(() => Promise.resolve('data:image/png;base64,test')),
  },
}));

vi.mock('pptxgenjs', () => ({
  default: vi.fn().mockImplementation(() => ({
    layout: '',
    author: '',
    title: '',
    subject: '',
    addSlide: vi.fn(() => ({
      background: '',
      addText: vi.fn(),
      addImage: vi.fn(),
      addShape: vi.fn(),
      addNotes: vi.fn(),
    })),
    writeFile: vi.fn(() => Promise.resolve()),
    ShapeType: { rect: 'rect' },
  })),
}));

vi.mock('puppeteer', () => ({
  default: {
    launch: vi.fn(() =>
      Promise.resolve({
        newPage: vi.fn(() =>
          Promise.resolve({
            setViewport: vi.fn(),
            setContent: vi.fn(),
            screenshot: vi.fn(),
          })
        ),
        close: vi.fn(),
      })
    ),
  },
}));

vi.mock('fluent-ffmpeg', () => ({
  default: vi.fn(() => ({
    input: vi.fn().mockReturnThis(),
    inputFPS: vi.fn().mockReturnThis(),
    videoCodec: vi.fn().mockReturnThis(),
    outputOptions: vi.fn().mockReturnThis(),
    output: vi.fn().mockReturnThis(),
    on: vi.fn(function (this: any, event: string, callback: Function) {
      if (event === 'end') {
        setTimeout(() => callback(), 10);
      }
      return this;
    }),
    run: vi.fn(),
  })),
}));

vi.mock('fs/promises', () => ({
  mkdir: vi.fn(() => Promise.resolve()),
  writeFile: vi.fn(() => Promise.resolve()),
  unlink: vi.fn(() => Promise.resolve()),
  rm: vi.fn(() => Promise.resolve()),
  access: vi.fn(() => Promise.resolve()),
}));

describe('ExportService', () => {
  let exportService: ExportService;
  let mockPresentation: Presentation;

  beforeEach(() => {
    exportService = new ExportService();
    
    mockPresentation = {
      id: 'test-presentation',
      title: 'Test Presentation',
      description: 'A test presentation',
      slides: [
        {
          id: 'slide-1',
          presentationId: 'test-presentation',
          order: 0,
          elements: [
            {
              id: 'elem-1',
              type: 'text',
              position: { x: 100, y: 100 },
              size: { width: 400, height: 100 },
              rotation: 0,
              style: {
                fontSize: 24,
                color: '#000000',
                fontFamily: 'Arial',
              },
              content: { text: 'Hello World' },
              zIndex: 1,
            },
          ],
          background: {
            type: 'solid',
            value: '#FFFFFF',
          },
        },
      ],
      theme: {
        name: 'Default',
        colors: {
          primary: '#0066CC',
          secondary: '#6B7280',
          background: '#FFFFFF',
          text: '#000000',
          accent: '#10B981',
        },
        fonts: {
          heading: 'Arial',
          body: 'Arial',
          code: 'Courier',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  describe('PDF Export', () => {
    it('should create a PDF export job', async () => {
      const config: ExportConfig = {
        format: 'pdf',
        options: {
          quality: 'medium',
        },
      };

      const job = await exportService.exportPDF(mockPresentation, config);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.presentationId).toBe(mockPresentation.id);
      expect(job.format).toBe('pdf');
      expect(job.status).toBe('pending');
      expect(job.progress).toBe(0);
    });

    it('should handle PDF export with slide range', async () => {
      const config: ExportConfig = {
        format: 'pdf',
        options: {
          quality: 'high',
          slideRange: [0, 0],
        },
      };

      const job = await exportService.exportPDF(mockPresentation, config);

      expect(job).toBeDefined();
      expect(job.status).toBe('pending');
    });

    it('should handle PDF export with notes', async () => {
      mockPresentation.slides[0].notes = 'Test note';
      
      const config: ExportConfig = {
        format: 'pdf',
        options: {
          includeNotes: true,
        },
      };

      const job = await exportService.exportPDF(mockPresentation, config);

      expect(job).toBeDefined();
    });
  });

  describe('PPTX Export', () => {
    it('should create a PPTX export job', async () => {
      const config: ExportConfig = {
        format: 'pptx',
        options: {
          quality: 'medium',
        },
      };

      const job = await exportService.exportPPTX(mockPresentation, config);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.presentationId).toBe(mockPresentation.id);
      expect(job.format).toBe('pptx');
      expect(job.status).toBe('pending');
    });

    it('should handle PPTX export with different element types', async () => {
      mockPresentation.slides[0].elements.push(
        {
          id: 'elem-2',
          type: 'image',
          position: { x: 200, y: 200 },
          size: { width: 300, height: 200 },
          rotation: 0,
          style: {},
          content: { src: 'test.jpg' },
          zIndex: 2,
        },
        {
          id: 'elem-3',
          type: 'shape',
          position: { x: 300, y: 300 },
          size: { width: 100, height: 100 },
          rotation: 0,
          style: {
            fill: '#FF0000',
            stroke: '#000000',
            strokeWidth: 2,
          },
          content: {},
          zIndex: 3,
        }
      );

      const config: ExportConfig = {
        format: 'pptx',
        options: {},
      };

      const job = await exportService.exportPPTX(mockPresentation, config);

      expect(job).toBeDefined();
    });
  });

  describe('HTML Export', () => {
    it('should create an HTML export job', async () => {
      const config: ExportConfig = {
        format: 'html',
        options: {},
      };

      const job = await exportService.exportHTML(mockPresentation, config);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.presentationId).toBe(mockPresentation.id);
      expect(job.format).toBe('html');
      expect(job.status).toBe('pending');
    });

    it('should handle HTML export with slide range', async () => {
      mockPresentation.slides.push({
        id: 'slide-2',
        presentationId: 'test-presentation',
        order: 1,
        elements: [],
        background: { type: 'solid', value: '#F0F0F0' },
      });

      const config: ExportConfig = {
        format: 'html',
        options: {
          slideRange: [0, 0],
        },
      };

      const job = await exportService.exportHTML(mockPresentation, config);

      expect(job).toBeDefined();
    });
  });

  describe('Video Export', () => {
    it('should create a video export job', async () => {
      const config: ExportConfig = {
        format: 'video',
        options: {
          videoFps: 30,
        },
      };

      const job = await exportService.exportVideo(mockPresentation, config);

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.presentationId).toBe(mockPresentation.id);
      expect(job.format).toBe('video');
      expect(job.status).toBe('pending');
    });

    it('should handle custom video codec', async () => {
      const config: ExportConfig = {
        format: 'video',
        options: {
          videoFps: 60,
          videoCodec: 'libx265',
        },
      };

      const job = await exportService.exportVideo(mockPresentation, config);

      expect(job).toBeDefined();
    });
  });

  describe('Job Management', () => {
    it('should retrieve a job by ID', async () => {
      const config: ExportConfig = {
        format: 'pdf',
        options: {},
      };

      const job = await exportService.exportPDF(mockPresentation, config);
      const retrievedJob = exportService.getJob(job.id);

      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.id).toBe(job.id);
    });

    it('should return undefined for non-existent job', () => {
      const job = exportService.getJob('non-existent-id');

      expect(job).toBeUndefined();
    });

    it('should retrieve all jobs', async () => {
      const config: ExportConfig = {
        format: 'pdf',
        options: {},
      };

      await exportService.exportPDF(mockPresentation, config);
      await exportService.exportPPTX(mockPresentation, config);

      const allJobs = exportService.getAllJobs();

      expect(allJobs).toHaveLength(2);
    });

    it('should delete a job', async () => {
      const config: ExportConfig = {
        format: 'pdf',
        options: {},
      };

      const job = await exportService.exportPDF(mockPresentation, config);
      const deleted = exportService.deleteJob(job.id);

      expect(deleted).toBe(true);
      expect(exportService.getJob(job.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent job', () => {
      const deleted = exportService.deleteJob('non-existent-id');

      expect(deleted).toBe(false);
    });
  });

  describe('WebSocket Integration', () => {
    it('should set socket.io instance', () => {
      const mockIO = {} as any;
      
      exportService.setSocketIO(mockIO);

      expect(() => exportService.setSocketIO(mockIO)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle export errors gracefully', async () => {
      const config: ExportConfig = {
        format: 'pdf',
        options: {},
      };

      const job = await exportService.exportPDF(mockPresentation, config);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(job).toBeDefined();
    });
  });
});
