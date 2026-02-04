export interface AppSettings {
  id: string;
  passwordProtection: boolean;
  password?: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  exportQuality: 'draft' | 'standard' | 'hd';
  aiModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsDto {
  passwordProtection?: boolean;
  password?: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
  exportQuality?: 'draft' | 'standard' | 'hd';
  aiModel?: string;
}
