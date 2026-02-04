import { autoUpdater } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';

export function setupAutoUpdater(): void {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.send('updater:update-available', {
        version: info.version,
      });
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('No updates available. Current version:', info.version);
  });

  autoUpdater.on('error', (error) => {
    console.error('Update error:', error);
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.send('updater:error', error.message);
    });
  });

  autoUpdater.on('download-progress', (progressInfo) => {
    console.log(`Download progress: ${progressInfo.percent}%`);
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.send('updater:download-progress', {
        percent: progressInfo.percent,
        bytesPerSecond: progressInfo.bytesPerSecond,
        transferred: progressInfo.transferred,
        total: progressInfo.total,
      });
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((window) => {
      window.webContents.send('updater:update-downloaded');
    });
  });

  ipcMain.on('updater:checkForUpdates', () => {
    autoUpdater.checkForUpdates().catch((error) => {
      console.error('Failed to check for updates:', error);
    });
  });

  ipcMain.on('updater:installUpdate', () => {
    autoUpdater.quitAndInstall(false, true);
  });

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((error) => {
      console.error('Auto-update check failed:', error);
    });
  }, 3000);
}
