export interface FileSystemAPI {
  readFile: (filePath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  readDir: (
    dirPath: string
  ) => Promise<{ success: boolean; data?: Array<{ name: string; isDirectory: boolean; isFile: boolean }>; error?: string }>;
  createDir: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  exists: (filePath: string) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  stat: (
    filePath: string
  ) => Promise<{
    success: boolean;
    data?: { size: number; isDirectory: boolean; isFile: boolean; mtime: Date; ctime: Date };
    error?: string;
  }>;
  selectFile: (options?: {
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{ success: boolean; data?: string | null; error?: string }>;
  selectFolder: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
  saveFile: (options?: {
    defaultPath?: string;
    filters?: { name: string; extensions: string[] }[];
  }) => Promise<{ success: boolean; data?: string | null; error?: string }>;
}

export interface AppAPI {
  getVersion: () => Promise<{ success: boolean; data?: string; error?: string }>;
  getPath: (name: string) => Promise<{ success: boolean; data?: string; error?: string }>;
  quit: () => void;
  relaunch: () => void;
}

export interface WindowAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isMaximized: () => Promise<{ success: boolean; data?: boolean; error?: string }>;
}

export interface NotificationAPI {
  show: (title: string, body: string) => void;
}

export interface UpdaterAPI {
  checkForUpdates: () => void;
  onUpdateAvailable: (callback: (info: { version: string }) => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  onUpdateError: (callback: (error: string) => void) => void;
  installUpdate: () => void;
}

export interface ElectronAPI {
  platform: string;
  fs: FileSystemAPI;
  app: AppAPI;
  window: WindowAPI;
  notification: NotificationAPI;
  updater: UpdaterAPI;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}
