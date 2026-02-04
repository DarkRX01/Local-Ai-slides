import { BrowserWindow, IpcMain, dialog, app } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export function setupIpcHandlers(mainWindow: BrowserWindow, ipcMain: IpcMain): void {
  ipcMain.handle('fs:readFile', async (_event, filePath: string) => {
    try {
      const sanitizedPath = sanitizePath(filePath);
      const content = await fs.readFile(sanitizedPath, 'utf-8');
      return { success: true, data: content };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
    try {
      const sanitizedPath = sanitizePath(filePath);
      await fs.mkdir(path.dirname(sanitizedPath), { recursive: true });
      await fs.writeFile(sanitizedPath, content, 'utf-8');
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('fs:deleteFile', async (_event, filePath: string) => {
    try {
      const sanitizedPath = sanitizePath(filePath);
      await fs.unlink(sanitizedPath);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
    try {
      const sanitizedPath = sanitizePath(dirPath);
      const entries = await fs.readdir(sanitizedPath, { withFileTypes: true });
      const result = entries.map((entry) => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
      }));
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('fs:createDir', async (_event, dirPath: string) => {
    try {
      const sanitizedPath = sanitizePath(dirPath);
      await fs.mkdir(sanitizedPath, { recursive: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('fs:exists', async (_event, filePath: string) => {
    try {
      const sanitizedPath = sanitizePath(filePath);
      await fs.access(sanitizedPath);
      return { success: true, data: true };
    } catch {
      return { success: true, data: false };
    }
  });

  ipcMain.handle('fs:stat', async (_event, filePath: string) => {
    try {
      const sanitizedPath = sanitizePath(filePath);
      const stats = await fs.stat(sanitizedPath);
      return {
        success: true,
        data: {
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          mtime: stats.mtime,
          ctime: stats.ctime,
        },
      };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('dialog:selectFile', async (_event, options?: { filters?: { name: string; extensions: string[] }[] }) => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: options?.filters,
      });
      if (result.canceled) {
        return { success: true, data: null };
      }
      return { success: true, data: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('dialog:selectFolder', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      });
      if (result.canceled) {
        return { success: true, data: null };
      }
      return { success: true, data: result.filePaths[0] };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('dialog:saveFile', async (_event, options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) => {
    try {
      const result = await dialog.showSaveDialog(mainWindow, {
        defaultPath: options?.defaultPath,
        filters: options?.filters,
      });
      if (result.canceled) {
        return { success: true, data: null };
      }
      return { success: true, data: result.filePath };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.handle('app:getVersion', () => {
    return { success: true, data: app.getVersion() };
  });

  ipcMain.handle('app:getPath', (_event, name: string) => {
    try {
      const validNames = ['home', 'appData', 'userData', 'temp', 'downloads', 'documents', 'desktop'];
      if (!validNames.includes(name)) {
        throw new Error(`Invalid path name: ${name}`);
      }
      const pathValue = app.getPath(name as any);
      return { success: true, data: pathValue };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  });

  ipcMain.on('app:quit', () => {
    app.quit();
  });

  ipcMain.on('app:relaunch', () => {
    app.relaunch();
    app.quit();
  });

  ipcMain.on('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.on('window:close', () => {
    mainWindow.close();
  });

  ipcMain.handle('window:isMaximized', () => {
    return { success: true, data: mainWindow.isMaximized() };
  });
}

function sanitizePath(filePath: string): string {
  const normalized = path.normalize(filePath);
  
  if (normalized.includes('..')) {
    throw new Error('Path traversal not allowed');
  }
  
  return normalized;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
