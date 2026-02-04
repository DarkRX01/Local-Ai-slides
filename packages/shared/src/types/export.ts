export interface ExportConfig {
  format: 'pdf' | 'pptx' | 'html' | 'video';
  options: ExportOptions;
}

export interface ExportOptions {
  quality?: 'low' | 'medium' | 'high';
  includeNotes?: boolean;
  slideRange?: [number, number];
  videoFps?: number;
  videoCodec?: string;
}

export interface ExportJob {
  id: string;
  presentationId: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filePath?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}
