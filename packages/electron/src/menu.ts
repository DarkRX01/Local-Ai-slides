import { BrowserWindow, Menu, app, shell } from 'electron';

export function setupMenu(mainWindow: BrowserWindow): void {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' as const },
              { type: 'separator' as const },
              { role: 'services' as const },
              { type: 'separator' as const },
              { role: 'hide' as const },
              { role: 'hideOthers' as const },
              { role: 'unhide' as const },
              { type: 'separator' as const },
              { role: 'quit' as const },
            ],
          },
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Presentation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('menu:new-presentation');
          },
        },
        {
          label: 'Open Presentation',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu:open-presentation');
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            mainWindow.webContents.send('menu:save');
          },
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu:save-as');
          },
        },
        { type: 'separator' },
        {
          label: 'Export',
          submenu: [
            {
              label: 'Export as PDF',
              click: () => {
                mainWindow.webContents.send('menu:export-pdf');
              },
            },
            {
              label: 'Export as PPTX',
              click: () => {
                mainWindow.webContents.send('menu:export-pptx');
              },
            },
            {
              label: 'Export as HTML',
              click: () => {
                mainWindow.webContents.send('menu:export-html');
              },
            },
            {
              label: 'Export as Video',
              click: () => {
                mainWindow.webContents.send('menu:export-video');
              },
            },
          ],
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo', accelerator: 'CmdOrCtrl+Z' },
        { role: 'redo', accelerator: 'CmdOrCtrl+Shift+Z' },
        { type: 'separator' },
        { role: 'cut', accelerator: 'CmdOrCtrl+X' },
        { role: 'copy', accelerator: 'CmdOrCtrl+C' },
        { role: 'paste', accelerator: 'CmdOrCtrl+V' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll', accelerator: 'CmdOrCtrl+A' },
        { type: 'separator' },
        {
          label: 'Duplicate',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('menu:duplicate');
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn', accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut', accelerator: 'CmdOrCtrl+-' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { type: 'separator' },
        {
          label: 'Presentation Mode',
          accelerator: 'F5',
          click: () => {
            mainWindow.webContents.send('menu:presentation-mode');
          },
        },
      ],
    },
    {
      label: 'Insert',
      submenu: [
        {
          label: 'New Slide',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow.webContents.send('menu:new-slide');
          },
        },
        { type: 'separator' },
        {
          label: 'Text',
          accelerator: 'CmdOrCtrl+T',
          click: () => {
            mainWindow.webContents.send('menu:insert-text');
          },
        },
        {
          label: 'Image',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu:insert-image');
          },
        },
        {
          label: 'Shape',
          click: () => {
            mainWindow.webContents.send('menu:insert-shape');
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' as const }, { role: 'front' as const }, { type: 'separator' as const }, { role: 'window' as const }]
          : [{ role: 'close' as const }]),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/slides-clone/docs');
          },
        },
        {
          label: 'Report Issue',
          click: async () => {
            await shell.openExternal('https://github.com/slides-clone/issues');
          },
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            mainWindow.webContents.send('menu:check-updates');
          },
        },
        { type: 'separator' },
        {
          label: 'About',
          click: () => {
            mainWindow.webContents.send('menu:about');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
