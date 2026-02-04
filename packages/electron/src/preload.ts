import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  platform: process.platform,
  
  fs: {
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:writeFile', filePath, content),
    deleteFile: (filePath: string) => ipcRenderer.invoke('fs:deleteFile', filePath),
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
    createDir: (dirPath: string) => ipcRenderer.invoke('fs:createDir', dirPath),
    exists: (filePath: string) => ipcRenderer.invoke('fs:exists', filePath),
    stat: (filePath: string) => ipcRenderer.invoke('fs:stat', filePath),
    selectFile: (options?: { filters?: { name: string; extensions: string[] }[] }) =>
      ipcRenderer.invoke('dialog:selectFile', options),
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    saveFile: (options?: { defaultPath?: string; filters?: { name: string; extensions: string[] }[] }) =>
      ipcRenderer.invoke('dialog:saveFile', options),
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name: string) => ipcRenderer.invoke('app:getPath', name),
    quit: () => ipcRenderer.send('app:quit'),
    relaunch: () => ipcRenderer.send('app:relaunch'),
  },

  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  notification: {
    show: (title: string, body: string) => ipcRenderer.send('notification:show', title, body),
  },

  updater: {
    checkForUpdates: () => ipcRenderer.send('updater:checkForUpdates'),
    onUpdateAvailable: (callback: (info: { version: string }) => void) => {
      ipcRenderer.on('updater:update-available', (_event, info) => callback(info));
    },
    onUpdateDownloaded: (callback: () => void) => {
      ipcRenderer.on('updater:update-downloaded', () => callback());
    },
    onUpdateError: (callback: (error: string) => void) => {
      ipcRenderer.on('updater:error', (_event, error) => callback(error));
    },
    installUpdate: () => ipcRenderer.send('updater:installUpdate'),
  },
};

contextBridge.exposeInMainWorld('electron', electronAPI);

export type ElectronAPI = typeof electronAPI;
