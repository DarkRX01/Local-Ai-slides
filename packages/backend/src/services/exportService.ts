import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import type { Presentation, ExportConfig, ExportJob } from '@slides-clone/shared';
import type { Server as SocketIOServer } from 'socket.io';

export class ExportService {
  private jobs: Map<string, ExportJob> = new Map();
  private exportDir: string;
  private io?: SocketIOServer;

  constructor() {
    this.exportDir = path.join(process.cwd(), 'exports');
    this.ensureExportDir();
  }

  setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  private emitJobUpdate(job: ExportJob): void {
    if (this.io) {
      this.io.emit('export:progress', job);
    }
  }

  private async ensureExportDir(): Promise<void> {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create export directory:', error);
    }
  }

  async exportPDF(presentation: Presentation, config: ExportConfig): Promise<ExportJob> {
    const jobId = uuidv4();
    const job: ExportJob = {
      id: jobId,
      presentationId: presentation.id,
      format: 'pdf',
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    this.processPDFExport(presentation, config, job).catch((error) => {
      job.status = 'failed';
      job.error = error.message;
      this.emitJobUpdate(job);
    });

    return job;
  }

  private async processPDFExport(
    presentation: Presentation,
    config: ExportConfig,
    job: ExportJob
  ): Promise<void> {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: htmlToImage } = await import('html-to-image');

      job.status = 'processing';
      job.progress = 10;
      this.emitJobUpdate(job);

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080],
      });

      const quality = config.options.quality || 'standard';
      const qualityMap = { low: 0.5, medium: 0.75, high: 1.0 };
      const imageQuality = qualityMap[quality] || 0.75;

      const slideRange = config.options.slideRange || [0, presentation.slides.length - 1];
      const startSlide = slideRange[0];
      const endSlide = Math.min(slideRange[1], presentation.slides.length - 1);
      const totalSlides = endSlide - startSlide + 1;

      for (let i = startSlide; i <= endSlide; i++) {
        const slide = presentation.slides[i];

        const slideHtml = this.generateSlideHTML(slide, presentation.theme);
        const tempDiv = this.createTempElement(slideHtml);

        const dataUrl = await htmlToImage.toPng(tempDiv, {
          quality: imageQuality,
          width: 1920,
          height: 1080,
        });

        if (i > startSlide) {
          doc.addPage();
        }

        doc.addImage(dataUrl, 'PNG', 0, 0, 1920, 1080);

        if (config.options.includeNotes && slide.notes) {
          doc.addPage();
          doc.setFontSize(12);
          doc.text(slide.notes, 50, 50, { maxWidth: 1820 });
        }

        this.removeTempElement(tempDiv);

        job.progress = 10 + Math.floor((i - startSlide + 1) / totalSlides * 80);
        this.emitJobUpdate(job);
      }

      const fileName = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
      const filePath = path.join(this.exportDir, fileName);

      await fs.writeFile(filePath, doc.output('arraybuffer'));

      job.status = 'completed';
      job.progress = 100;
      job.filePath = filePath;
      job.completedAt = new Date().toISOString();
      this.emitJobUpdate(job);
    } catch (error) {
      throw new Error(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportPPTX(presentation: Presentation, config: ExportConfig): Promise<ExportJob> {
    const jobId = uuidv4();
    const job: ExportJob = {
      id: jobId,
      presentationId: presentation.id,
      format: 'pptx',
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    this.processPPTXExport(presentation, config, job).catch((error) => {
      job.status = 'failed';
      job.error = error.message;
      this.emitJobUpdate(job);
    });

    return job;
  }

  private async processPPTXExport(
    presentation: Presentation,
    config: ExportConfig,
    job: ExportJob
  ): Promise<void> {
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();

      job.status = 'processing';
      job.progress = 10;
      this.emitJobUpdate(job);

      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Slides Clone';
      pptx.title = presentation.title;
      pptx.subject = presentation.description || '';

      const slideRange = config.options.slideRange || [0, presentation.slides.length - 1];
      const startSlide = slideRange[0];
      const endSlide = Math.min(slideRange[1], presentation.slides.length - 1);
      const totalSlides = endSlide - startSlide + 1;

      for (let i = startSlide; i <= endSlide; i++) {
        const slideData = presentation.slides[i];
        const slide = pptx.addSlide();

        if (slideData.background) {
          if (slideData.background.type === 'solid') {
            slide.background = { color: slideData.background.value as string };
          } else if (slideData.background.type === 'image') {
            slide.background = { path: slideData.background.value as string };
          }
        }

        for (const element of slideData.elements) {
          const x = (element.position.x / 1920) * 10;
          const y = (element.position.y / 1080) * 5.625;
          const w = (element.size.width / 1920) * 10;
          const h = (element.size.height / 1080) * 5.625;

          if (element.type === 'text') {
            const textContent = element.content as { text: string };
            slide.addText(textContent.text || '', {
              x,
              y,
              w,
              h,
              fontSize: element.style.fontSize || 18,
              color: element.style.color || '000000',
              fontFace: element.style.fontFamily || 'Arial',
              align: element.style.textAlign || 'left',
              bold: element.style.fontWeight === 'bold',
            });
          } else if (element.type === 'image') {
            const imageContent = element.content as { src: string };
            slide.addImage({
              path: imageContent.src,
              x,
              y,
              w,
              h,
            });
          } else if (element.type === 'shape') {
            slide.addShape(pptx.ShapeType.rect, {
              x,
              y,
              w,
              h,
              fill: { color: element.style.fill || 'CCCCCC' },
              line: element.style.stroke ? {
                color: element.style.stroke,
                width: element.style.strokeWidth || 1,
              } : undefined,
            });
          }
        }

        if (config.options.includeNotes && slideData.notes) {
          slide.addNotes(slideData.notes);
        }

        job.progress = 10 + Math.floor((i - startSlide + 1) / totalSlides * 80);
        this.emitJobUpdate(job);
      }

      const fileName = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pptx`;
      const filePath = path.join(this.exportDir, fileName);

      await pptx.writeFile({ fileName: filePath });

      job.status = 'completed';
      job.progress = 100;
      job.filePath = filePath;
      job.completedAt = new Date().toISOString();
      this.emitJobUpdate(job);
    } catch (error) {
      throw new Error(`PPTX export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportHTML(presentation: Presentation, config: ExportConfig): Promise<ExportJob> {
    const jobId = uuidv4();
    const job: ExportJob = {
      id: jobId,
      presentationId: presentation.id,
      format: 'html',
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    this.processHTMLExport(presentation, config, job).catch((error) => {
      job.status = 'failed';
      job.error = error.message;
      this.emitJobUpdate(job);
    });

    return job;
  }

  private async processHTMLExport(
    presentation: Presentation,
    config: ExportConfig,
    job: ExportJob
  ): Promise<void> {
    try {
      job.status = 'processing';
      job.progress = 10;
      this.emitJobUpdate(job);

      const slideRange = config.options.slideRange || [0, presentation.slides.length - 1];
      const slides = presentation.slides.slice(slideRange[0], slideRange[1] + 1);

      const html = this.generatePresentationHTML(presentation, slides, config);

      const fileName = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.html`;
      const filePath = path.join(this.exportDir, fileName);

      await fs.writeFile(filePath, html, 'utf-8');

      job.status = 'completed';
      job.progress = 100;
      job.filePath = filePath;
      job.completedAt = new Date().toISOString();
      this.emitJobUpdate(job);
    } catch (error) {
      throw new Error(`HTML export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportVideo(presentation: Presentation, config: ExportConfig): Promise<ExportJob> {
    const jobId = uuidv4();
    const job: ExportJob = {
      id: jobId,
      presentationId: presentation.id,
      format: 'video',
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    this.processVideoExport(presentation, config, job).catch((error) => {
      job.status = 'failed';
      job.error = error.message;
      this.emitJobUpdate(job);
    });

    return job;
  }

  private async processVideoExport(
    presentation: Presentation,
    config: ExportConfig,
    job: ExportJob
  ): Promise<void> {
    try {
      const puppeteer = await import('puppeteer');
      const ffmpeg = await import('fluent-ffmpeg');

      job.status = 'processing';
      job.progress = 5;

      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      const slideRange = config.options.slideRange || [0, presentation.slides.length - 1];
      const fps = config.options.videoFps || 30;
      const slideDuration = 5;
      const framesDir = path.join(this.exportDir, `frames_${jobId}`);
      await fs.mkdir(framesDir, { recursive: true });

      let frameCount = 0;
      const totalSlides = slideRange[1] - slideRange[0] + 1;

      for (let i = slideRange[0]; i <= slideRange[1]; i++) {
        const slide = presentation.slides[i];
        const slideHtml = this.generateSlideHTML(slide, presentation.theme);

        await page.setContent(slideHtml, { waitUntil: 'networkidle0' });

        const totalFrames = slideDuration * fps;

        for (let frame = 0; frame < totalFrames; frame++) {
          const framePath = path.join(framesDir, `frame_${String(frameCount).padStart(6, '0')}.png`);
          await page.screenshot({ path: framePath, type: 'png' });
          frameCount++;
        }

        job.progress = 5 + Math.floor((i - slideRange[0] + 1) / totalSlides * 70);
        this.emitJobUpdate(job);
      }

      await browser.close();

      job.progress = 80;
      this.emitJobUpdate(job);

      const fileName = `${presentation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.mp4`;
      const filePath = path.join(this.exportDir, fileName);

      await new Promise<void>((resolve, reject) => {
        ffmpeg.default()
          .input(path.join(framesDir, 'frame_%06d.png'))
          .inputFPS(fps)
          .videoCodec(config.options.videoCodec || 'libx264')
          .outputOptions(['-pix_fmt yuv420p'])
          .output(filePath)
          .on('progress', (progress) => {
            if (progress.percent) {
              job.progress = 80 + Math.floor(progress.percent * 0.15);
              this.emitJobUpdate(job);
            }
          })
          .on('end', () => {
            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .run();
      });

      await fs.rm(framesDir, { recursive: true, force: true });

      job.status = 'completed';
      job.progress = 100;
      job.filePath = filePath;
      job.completedAt = new Date().toISOString();
      this.emitJobUpdate(job);
    } catch (error) {
      throw new Error(`Video export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getJob(jobId: string): ExportJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ExportJob[] {
    return Array.from(this.jobs.values());
  }

  deleteJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (job && job.filePath) {
      fs.unlink(job.filePath).catch(() => {});
    }
    return this.jobs.delete(jobId);
  }

  private generateSlideHTML(slide: any, theme: any): string {
    const backgroundStyle = slide.background
      ? slide.background.type === 'solid'
        ? `background-color: ${slide.background.value};`
        : `background-image: url(${slide.background.value});`
      : `background-color: ${theme.colors.background};`;

    const elementsHTML = slide.elements
      .map((element: any) => {
        const style = `
          position: absolute;
          left: ${element.position.x}px;
          top: ${element.position.y}px;
          width: ${element.size.width}px;
          height: ${element.size.height}px;
          transform: rotate(${element.rotation}deg);
          z-index: ${element.zIndex};
          opacity: ${element.style.opacity || 1};
        `;

        if (element.type === 'text') {
          return `
            <div style="${style}
              font-family: ${element.style.fontFamily || theme.fonts.body};
              font-size: ${element.style.fontSize || 16}px;
              font-weight: ${element.style.fontWeight || 'normal'};
              color: ${element.style.color || theme.colors.text};
              text-align: ${element.style.textAlign || 'left'};
            ">
              ${element.content.text || ''}
            </div>
          `;
        } else if (element.type === 'image') {
          return `
            <img src="${element.content.src}" style="${style} object-fit: contain;" />
          `;
        } else if (element.type === 'shape') {
          return `
            <div style="${style}
              background-color: ${element.style.fill || 'transparent'};
              border: ${element.style.strokeWidth || 0}px solid ${element.style.stroke || 'transparent'};
            "></div>
          `;
        }
        return '';
      })
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 0;
              width: 1920px;
              height: 1080px;
              overflow: hidden;
            }
            .slide {
              position: relative;
              width: 1920px;
              height: 1080px;
              ${backgroundStyle}
            }
          </style>
        </head>
        <body>
          <div class="slide">
            ${elementsHTML}
          </div>
        </body>
      </html>
    `;
  }

  private generatePresentationHTML(presentation: Presentation, slides: any[], config: ExportConfig): string {
    const slidesHTML = slides
      .map((slide, index) => {
        const slideContent = this.generateSlideHTML(slide, presentation.theme);
        return slideContent.replace('<!DOCTYPE html>', '').replace(/<\/?html>/g, '').replace(/<\/?head>/g, '').replace(/<\/?body>/g, '');
      })
      .join('\n');

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${presentation.title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: ${presentation.theme.fonts.body};
              background: #000;
              overflow: hidden;
            }
            #presentation {
              width: 100vw;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .slide {
              display: none;
              position: relative;
              width: 1920px;
              height: 1080px;
              transform-origin: center;
            }
            .slide.active {
              display: block;
            }
            #controls {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 0, 0, 0.7);
              padding: 10px 20px;
              border-radius: 5px;
              display: flex;
              gap: 10px;
              z-index: 10000;
            }
            button {
              background: #fff;
              border: none;
              padding: 10px 20px;
              border-radius: 3px;
              cursor: pointer;
              font-size: 14px;
            }
            button:hover {
              background: #eee;
            }
            #slide-number {
              color: #fff;
              line-height: 40px;
              padding: 0 15px;
            }
          </style>
        </head>
        <body>
          <div id="presentation">
            ${slidesHTML}
          </div>
          <div id="controls">
            <button id="prev">← Previous</button>
            <span id="slide-number">1 / ${slides.length}</span>
            <button id="next">Next →</button>
          </div>
          <script>
            let currentSlide = 0;
            const slides = document.querySelectorAll('.slide');
            const slideNumber = document.getElementById('slide-number');

            function showSlide(n) {
              slides[currentSlide].classList.remove('active');
              currentSlide = (n + slides.length) % slides.length;
              slides[currentSlide].classList.add('active');
              slideNumber.textContent = (currentSlide + 1) + ' / ' + slides.length;
              scaleSlide();
            }

            function scaleSlide() {
              const container = document.getElementById('presentation');
              const slide = slides[currentSlide];
              const scaleX = container.clientWidth / 1920;
              const scaleY = container.clientHeight / 1080;
              const scale = Math.min(scaleX, scaleY);
              slide.style.transform = 'scale(' + scale + ')';
            }

            document.getElementById('prev').addEventListener('click', () => showSlide(currentSlide - 1));
            document.getElementById('next').addEventListener('click', () => showSlide(currentSlide + 1));
            
            document.addEventListener('keydown', (e) => {
              if (e.key === 'ArrowLeft') showSlide(currentSlide - 1);
              if (e.key === 'ArrowRight') showSlide(currentSlide + 1);
            });

            window.addEventListener('resize', scaleSlide);
            showSlide(0);
          </script>
        </body>
      </html>
    `;
  }

  private createTempElement(html: string): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('Document is not available in Node.js environment');
    }
    const div = document.createElement('div');
    div.innerHTML = html;
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    document.body.appendChild(div);
    return div;
  }

  private removeTempElement(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

export const exportService = new ExportService();
