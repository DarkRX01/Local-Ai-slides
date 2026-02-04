export interface VoiceCommandRequest {
  audioData: Buffer | string;
  language?: string;
  model?: string;
}

export interface VoiceCommandResponse {
  transcript: string;
  language: string;
  confidence: number;
  duration: number;
}

export interface VoiceCommand {
  id: string;
  transcript: string;
  command: string;
  parameters?: Record<string, unknown>;
  timestamp: string;
}

export interface TTSRequest {
  text: string;
  language?: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSResponse {
  audioData: Buffer | string;
  format: 'wav' | 'mp3';
  duration: number;
}

export interface VoiceOverRequest {
  slideId: string;
  text?: string;
  language?: string;
  voice?: string;
}

export interface VoiceOverResponse {
  slideId: string;
  audioUrl: string;
  duration: number;
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  voice: string;
  speed: number;
  pitch: number;
  autoGenerateVoiceOvers: boolean;
}

export interface AvailableVoice {
  id: string;
  name: string;
  language: string;
  languageCode: string;
  gender?: 'male' | 'female' | 'neutral';
}

export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  language?: string;
}

export interface SlideVoiceOver {
  id: string;
  slideId: string;
  audioPath: string;
  duration: number;
  language: string;
  createdAt: string;
}

export interface VoiceCommandAction {
  type: 'navigate' | 'create' | 'edit' | 'delete' | 'export' | 'theme' | 'unknown';
  target?: string;
  value?: unknown;
}
