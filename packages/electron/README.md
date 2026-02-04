# Electron Desktop Application

Cross-platform desktop application for Slides Clone built with Electron.

## Features

- **Native Desktop Integration**: Full desktop app experience on Windows, macOS, and Linux
- **File System Access**: Secure IPC-based file operations (read, write, delete, dialogs)
- **Window State Persistence**: Remembers window size, position, and maximized state
- **Native Menus**: Platform-specific menus with keyboard shortcuts
- **Auto-Update**: Automatic update checking and installation (production builds)
- **Native Notifications**: System notifications for important events
- **Security**: Context isolation, sandboxing, and CSP headers enabled

## Project Structure

```
packages/electron/
├── src/
│   ├── main.ts              # Main process entry point
│   ├── preload.ts           # Preload script for secure IPC
│   ├── ipc-handlers.ts      # IPC message handlers
│   ├── window-state.ts      # Window state management
│   ├── menu.ts              # Application menu configuration
│   ├── auto-updater.ts      # Auto-update functionality
│   ├── notifications.ts     # Native notifications
│   └── types.d.ts           # TypeScript type definitions
├── resources/
│   ├── icon.ico             # Windows icon (to be provided)
│   ├── icon.icns            # macOS icon (to be provided)
│   ├── icon.png             # Linux icon (to be provided)
│   ├── entitlements.mac.plist # macOS entitlements
│   └── README.md            # Icon generation guide
├── package.json
├── tsconfig.json
└── .eslintrc.cjs
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Built frontend and backend packages

### Setup

1. Install dependencies from project root:
   ```bash
   npm install
   ```

2. Build the required packages:
   ```bash
   npm run build --workspace=packages/frontend
   npm run build --workspace=packages/backend
   ```

### Running in Development Mode

Development mode runs the Electron app pointing to local development servers:

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend

# Terminal 3: Start Electron (in dev mode)
npm run dev:electron
```

The Electron app will:
- Load the frontend from `http://localhost:3000` (Vite dev server)
- Connect to backend at `http://localhost:3001`
- Open DevTools automatically
- Enable hot reload for main process changes

### Environment Variables

Create a `.env` file in the electron package directory:

```env
NODE_ENV=development
FRONTEND_PORT=3000
BACKEND_PORT=3001
```

## Building

### Build for All Platforms

```bash
npm run build:electron
```

This creates installers in `packages/electron/build/`:

### Platform-Specific Builds

```bash
# Windows (NSIS installer and portable)
npm run build:electron:win

# macOS (DMG and ZIP)
npm run build:electron:mac

# Linux (AppImage, deb, rpm)
npm run build:electron:linux
```

### Build Configuration

The build is configured in `package.json` under the `build` key. Key settings:

- **appId**: `com.slides-clone.app`
- **Output Directory**: `build/`
- **Included Resources**: Frontend app, backend server, data files
- **Windows**: NSIS installer with user-selectable install directory
- **macOS**: Hardened runtime with entitlements, code signing ready
- **Linux**: AppImage, Debian, and RPM packages

## IPC Communication

The Electron app uses context isolation for security. Frontend code accesses Electron APIs through the `window.electron` object:

### File System Operations

```typescript
// Read file
const result = await window.electron.fs.readFile('/path/to/file.txt');
if (result.success) {
  console.log(result.data);
}

// Write file
await window.electron.fs.writeFile('/path/to/file.txt', 'content');

// File dialog
const filePath = await window.electron.fs.selectFile({
  filters: [{ name: 'Presentations', extensions: ['json', 'pptx'] }]
});
```

### Application Controls

```typescript
// Get app version
const version = await window.electron.app.getVersion();

// Get user paths
const downloadsPath = await window.electron.app.getPath('downloads');

// Window controls
window.electron.window.minimize();
window.electron.window.maximize();
window.electron.window.close();
```

### Notifications

```typescript
window.electron.notification.show('Title', 'Message body');
```

### Auto-Updates

```typescript
// Check for updates
window.electron.updater.checkForUpdates();

// Listen for update events
window.electron.updater.onUpdateAvailable((info) => {
  console.log(`Update available: ${info.version}`);
});

window.electron.updater.onUpdateDownloaded(() => {
  // Prompt user to install
  window.electron.updater.installUpdate();
});
```

## Menu Integration

The app provides menu events that the frontend can listen to:

```typescript
// Example: Listen for menu events via custom event system
// (Implementation depends on your frontend architecture)

ipcRenderer.on('menu:new-presentation', () => {
  // Handle new presentation
});

ipcRenderer.on('menu:save', () => {
  // Handle save
});

ipcRenderer.on('menu:export-pdf', () => {
  // Trigger PDF export
});
```

## Security

The Electron app follows security best practices:

- **Context Isolation**: Renderer process is isolated from Node.js
- **Sandbox**: Renderer runs in a sandboxed environment
- **No Node Integration**: `nodeIntegration: false` in webPreferences
- **Preload Script**: All IPC communication goes through controlled preload script
- **CSP Headers**: Content Security Policy headers enforced
- **Path Sanitization**: File paths are sanitized to prevent traversal attacks
- **External Link Handling**: HTTP(S) links open in default browser, not in app

## Icons

Icons are required for production builds. Place these files in `resources/`:

- `icon.ico` - Windows (256x256 or multi-resolution)
- `icon.icns` - macOS (multiple resolutions from 16x16 to 1024x1024)
- `icon.png` - Linux (512x512 or 1024x1024)

See `resources/README.md` for icon generation instructions.

## Troubleshooting

### App Won't Start

- Ensure backend and frontend are built: `npm run build`
- Check that ports 3000 and 3001 are available (dev mode)
- Check Electron logs in console

### File Operations Fail

- Check file paths are absolute, not relative
- Ensure the app has permission to access the directory
- Check for path traversal attempts (they're blocked)

### Updates Not Working

- Auto-update only works in production builds
- Requires proper code signing (macOS/Windows)
- Check network connectivity
- Verify update server is configured

### Build Fails

- Ensure all dependencies are installed
- Check that icons are present in `resources/`
- Verify you have required build tools for your platform
  - Windows: No additional tools required
  - macOS: Xcode Command Line Tools
  - Linux: `rpm`, `fakeroot`, `dpkg` for respective formats

## Code Signing

For production releases, code signing is required:

### macOS

```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
npm run build:electron:mac
```

### Windows

```bash
set CSC_LINK=C:\path\to\certificate.pfx
set CSC_KEY_PASSWORD=your_password
npm run build:electron:win
```

## Publishing Updates

The auto-updater is configured for electron-updater. To publish updates:

1. Configure your update server in `package.json` under `build.publish`
2. Build the app with updated version number
3. Upload build artifacts to your update server
4. The app will check for updates on launch

## License

MIT
