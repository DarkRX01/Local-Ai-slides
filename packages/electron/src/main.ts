import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { WindowStateManager } from './window-state';
import { setupMenu } from './menu';
import { setupIpcHandlers } from './ipc-handlers';
import { setupAutoUpdater } from './auto-updater';
import { showNotification, setupNotificationHandlers } from './notifications';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = process.env.BACKEND_PORT || 3001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

async function startBackendServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    const backendPath = isDev
      ? path.join(__dirname, '../../backend/src/index.ts')
      : path.join(process.resourcesPath, 'backend/index.js');

    const command = isDev ? 'tsx' : 'node';
    const args = [backendPath];

    backendProcess = spawn(command, args, {
      env: {
        ...process.env,
        PORT: String(BACKEND_PORT),
        NODE_ENV: isDev ? 'development' : 'production',
      },
      stdio: 'inherit',
    });

    backendProcess.on('error', (error) => {
      console.error('Failed to start backend server:', error);
      reject(error);
    });

    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        console.log(`Backend server started on port ${BACKEND_PORT}`);
        resolve();
      } else {
        reject(new Error('Backend process died unexpectedly'));
      }
    }, 2000);
  });
}

function createWindow(): void {
  const windowStateManager = new WindowStateManager();
  const windowState = windowStateManager.getState();

  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  if (windowState.isMaximized) {
    mainWindow.maximize();
  }

  windowStateManager.track(mainWindow);

  const startUrl = isDev
    ? `http://localhost:${FRONTEND_PORT}`
    : `file://${path.join(process.resourcesPath, 'app/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupMenu(mainWindow);
  setupIpcHandlers(mainWindow, ipcMain);
  setupNotificationHandlers();

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          isDev
            ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* ws://localhost:*"
            : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws://localhost:*; font-src 'self' data:",
        ],
      },
    });
  });
}

app.whenReady().then(async () => {
  try {
    if (!isDev) {
      await startBackendServer();
    }

    createWindow();

    if (!isDev) {
      setupAutoUpdater();
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    showNotification('Initialization Error', 'Failed to start the application. Please check logs.');
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  showNotification('Application Error', 'An unexpected error occurred.');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
