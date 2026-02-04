interface ExportMessage {
  type: 'export-html' | 'export-pdf' | 'process-image';
  payload: unknown;
}

interface ExportResponse {
  type: 'success' | 'error' | 'progress';
  data?: unknown;
  error?: string;
  progress?: number;
}

self.onmessage = async (event: MessageEvent<ExportMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'process-image':
        await processImage(payload);
        break;
      case 'export-html':
        await exportHTML(payload);
        break;
      case 'export-pdf':
        await exportPDF(payload);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const response: ExportResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(response);
  }
};

async function processImage(payload: unknown): Promise<void> {
  const { imageData, operations } = payload as {
    imageData: ImageData;
    operations: Array<{ type: string; params: Record<string, unknown> }>;
  };

  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.putImageData(imageData, 0, 0);

  for (const operation of operations) {
    switch (operation.type) {
      case 'brightness':
        applyBrightness(ctx, imageData, operation.params.value as number);
        break;
      case 'contrast':
        applyContrast(ctx, imageData, operation.params.value as number);
        break;
      case 'blur':
        applyBlur(ctx, imageData, operation.params.radius as number);
        break;
    }
  }

  const blob = await canvas.convertToBlob({ type: 'image/png' });
  const response: ExportResponse = {
    type: 'success',
    data: blob,
  };
  self.postMessage(response);
}

function applyBrightness(
  ctx: OffscreenCanvasRenderingContext2D,
  imageData: ImageData,
  value: number
): void {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] + value);
    data[i + 1] = Math.min(255, data[i + 1] + value);
    data[i + 2] = Math.min(255, data[i + 2] + value);
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyContrast(
  ctx: OffscreenCanvasRenderingContext2D,
  imageData: ImageData,
  value: number
): void {
  const data = imageData.data;
  const factor = (259 * (value + 255)) / (255 * (259 - value));
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }
  ctx.putImageData(imageData, 0, 0);
}

function applyBlur(
  ctx: OffscreenCanvasRenderingContext2D,
  _imageData: ImageData,
  radius: number
): void {
  ctx.filter = `blur(${radius}px)`;
}

async function exportHTML(payload: unknown): Promise<void> {
  self.postMessage({ type: 'progress', progress: 50 });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  self.postMessage({
    type: 'success',
    data: { html: '<html>Exported content</html>' },
  });
}

async function exportPDF(_payload: unknown): Promise<void> {
  self.postMessage({ type: 'progress', progress: 50 });
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  self.postMessage({
    type: 'success',
    data: { pdf: 'base64data' },
  });
}
