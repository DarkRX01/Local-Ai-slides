# 🎯 Slides Clone - AI-Powered Presentation App

> **For End Users**: Want to install and start using the app? See [**🪟 Windows Install Guide**](WINDOWS_INSTALL.md) for super simple 3-step installation!

A fully local, AI-powered presentation builder that runs entirely on your machine. Create stunning presentations with AI assistance, advanced animations, multi-language support, and image generation.

## 🚀 Quick Start

### Windows Users (Easiest)
1. **Download** the latest `.exe` from [Releases](https://github.com/YOUR_USERNAME/slides-clone/releases)
2. **Double-click** to install
3. **Done!** App launches automatically

👉 **[Full Windows Install Guide](WINDOWS_INSTALL.md)**

### Developers
See the [Development Setup](#development) section below.

## Features

- 🤖 **AI-Powered Generation**: Create entire presentations from prompts using local LLM models
- 🎨 **Advanced Editor**: Drag-and-drop slide editor with Fabric.js
- ✨ **Animations**: Professional animations with GSAP and Three.js
- 🌍 **Multi-Language**: Full Unicode support with LibreTranslate integration
- 🖼️ **Image Generation**: Local image generation with Stable Diffusion
- 📤 **Export**: Export to PDF, PPTX, HTML, and Video formats
- 🔒 **Fully Local**: Works entirely offline after initial setup

## Architecture

This is a monorepo with the following packages:

- **frontend**: React + Vite + TypeScript + Tailwind CSS
- **backend**: Express + TypeScript + SQLite + Socket.io
- **electron**: Desktop application wrapper
- **shared**: Shared types and constants

## Prerequisites

- Node.js 18+ and npm 9+
- Python 3.10+ (for AI services)
- Docker (for LibreTranslate)
- Visual Studio Build Tools (Windows) or build-essential (Linux) for native modules
- FFmpeg (for video export)
- Ollama (for AI features)

## Installation

### 1. Install Node Dependencies

**Note for Windows users**: The `better-sqlite3` package requires Visual Studio C++ build tools. Install them first:

```bash
# Option 1: Install Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
# Install the "Desktop development with C++" workload

# Option 2: Use windows-build-tools (as administrator)
npm install --global windows-build-tools
```

After installing build tools:

```bash
# Install all dependencies
npm install
```

### 2. Setup External Services

Run the automated setup script:

```bash
npm run setup:all
```

Or setup services individually:

```bash
npm run setup:ollama        # Install Ollama and AI models
npm run setup:translate     # Setup LibreTranslate via Docker
npm run setup:ffmpeg        # Verify FFmpeg installation
npm run setup:sd            # (Optional) Setup Stable Diffusion
```

### 3. Configure Environment

```bash
# Copy example environment file
cp packages/backend/.env.example packages/backend/.env

# Edit packages/backend/.env with your configuration
```

## Development

### Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:frontend    # Frontend on http://localhost:3000
npm run dev:backend     # Backend on http://localhost:3001
```

### Building

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:frontend
npm run build:backend
npm run build:electron
```

### Testing

```bash
# Run all tests
npm run test

# Run specific tests
npm run test:frontend
npm run test:backend
npm run test:e2e
npm run test:coverage
```

### Code Quality

```bash
# Linting
npm run lint
npm run lint:fix

# Type checking
npm run typecheck

# Formatting
npm run format
npm run format:check
```

## Project Structure

```
presentation-app/
├── packages/
│   ├── frontend/          # React frontend application
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   ├── backend/           # Express backend API
│   │   ├── src/
│   │   │   ├── db/       # Database schema and models
│   │   │   └── index.ts
│   │   └── package.json
│   ├── electron/          # Electron desktop app
│   │   ├── src/
│   │   └── package.json
│   └── shared/            # Shared TypeScript types
│       ├── src/
│       │   ├── types/
│       │   └── constants/
│       └── package.json
├── scripts/               # Setup and utility scripts
│   ├── setup-all.js
│   ├── setup-ollama.js
│   ├── setup-sd.js
│   ├── setup-translate.js
│   └── setup-ffmpeg.js
├── data/                  # SQLite database storage
└── package.json           # Root package.json (workspaces)
```

## Troubleshooting

### better-sqlite3 Installation Fails (Windows)

**Problem**: `gyp ERR! find VS` or missing Visual Studio C++ toolset

**Solution**:
1. Install Visual Studio 2022 Community Edition
2. During installation, select "Desktop development with C++"
3. Ensure "MSVC v143 - VS 2022 C++ x64/x86 build tools" is checked
4. Run `npm install` again

### Ollama Not Responding

**Problem**: Backend can't connect to Ollama

**Solution**:
1. Ensure Ollama is installed: `ollama --version`
2. Start Ollama service: `ollama serve`
3. Verify it's running: `curl http://localhost:11434/api/tags`

### LibreTranslate Container Won't Start

**Problem**: Docker container fails to start

**Solution**:
1. Ensure Docker is running: `docker ps`
2. Remove existing container: `docker rm -f libretranslate`
3. Run setup again: `npm run setup:translate`

### Port Already in Use

**Problem**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

## External Services

### Ollama (Required)
- **Purpose**: Local LLM for AI presentation generation
- **URL**: http://localhost:11434
- **Models**: llama3, mistral
- **Setup**: `npm run setup:ollama`

### LibreTranslate (Required)
- **Purpose**: Multi-language translation
- **URL**: http://localhost:5000
- **Setup**: `npm run setup:translate`

### Stable Diffusion WebUI (Optional)
- **Purpose**: Local image generation
- **URL**: http://localhost:7860
- **Setup**: `npm run setup:sd`
- **Note**: Requires ~10GB disk space and GPU

### FFmpeg (Required)
- **Purpose**: Video export functionality
- **Setup**: `npm run setup:ffmpeg`

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Fabric.js (canvas editing)
- GSAP (animations)
- Three.js (3D effects)
- Socket.io Client
- Radix UI (components)

### Backend
- Node.js + Express
- TypeScript
- better-sqlite3 (database)
- Socket.io (WebSocket)
- Sharp (image processing)
- Puppeteer (export)
- Axios (HTTP client)

### Desktop
- Electron
- electron-builder

## Documentation

### Getting Started
- **[README.md](README.md)** - Installation and quick start guide (this file)
- **[USER_GUIDE.md](USER_GUIDE.md)** - Complete user guide with tutorials and tips
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solutions to common problems

### Developer Resources
- **[API.md](API.md)** - Complete REST API documentation
- **[PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md)** - Guide for creating plugins
- **[SETUP_STATUS.md](SETUP_STATUS.md)** - Project scaffolding status report

### Quick Links
- **Getting Help**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues
- **API Reference**: See [API.md](API.md) for backend endpoints
- **User Guide**: See [USER_GUIDE.md](USER_GUIDE.md) for feature tutorials
- **Plugin Development**: See [PLUGIN_DEVELOPMENT.md](PLUGIN_DEVELOPMENT.md) to extend functionality

## License

MIT

## Contributing

This is a local-first application designed for offline use. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## Support

For issues and questions:

1. **Check Documentation**: Start with [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **Search Issues**: Look for similar problems on GitHub
3. **Open New Issue**: Include system info, error messages, and steps to reproduce
4. **Community**: Join our Discord server for real-time help

### Useful Resources
- [User Guide](USER_GUIDE.md) - Learn how to use all features
- [API Documentation](API.md) - Backend API reference
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
