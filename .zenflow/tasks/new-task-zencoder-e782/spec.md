# Technical Specification: Local Presentation Application

## Task Difficulty Assessment
**HARD** - This is a complex, full-stack application with multiple integrated systems including AI, advanced UI, animation engine, and multi-format export capabilities.

---

## 1. Technical Context

### Primary Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Tailwind CSS for styling
- Vite for build tooling and HMR
- State Management: Zustand (lightweight, performant)
- UI Components: Radix UI or shadcn/ui for accessible primitives

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- SQLite for local data persistence (presentations, settings, cache)
- WebSocket (Socket.io) for real-time collaboration simulation

**Desktop Container:**
- Electron for cross-platform desktop distribution
- Optional: Run as pure web app on localhost for lighter deployment

**Animation & Graphics:**
- GSAP (GreenSock Animation Platform) for timeline-based animations
- Three.js for 3D transitions
- Fabric.js or Konva.js for canvas-based slide editing
- React DnD or dnd-kit for drag-and-drop

**AI Integration:**
- Ollama for local LLM inference (Llama 3, Mistral, etc.)
- Stable Diffusion via Automatic1111 API or Stable Diffusion WebUI API
- LibreTranslate (self-hosted) for translation
- Whisper.cpp for voice-to-text (optional)
- eSpeak-ng for TTS (optional)

**Export Capabilities:**
- PDF: jsPDF or Puppeteer
- PPTX: PptxGenJS
- HTML: Static export with embedded assets
- Video: FFmpeg via child process

**Image Handling:**
- Sharp for image processing and optimization
- Google Custom Search API for image fetching (with API key)
- Web scraping fallback: Puppeteer for ethically questionable scraping

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ELECTRON SHELL                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    REACT FRONTEND (Vite)                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Editor     │  │  Animation   │  │   Export     │    │  │
│  │  │   Canvas     │  │   Timeline   │  │   Manager    │    │  │
│  │  │  (Fabric.js) │  │    (GSAP)    │  │              │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │     AI       │  │   Theme      │  │   Layer      │    │  │
│  │  │  Assistant   │  │   System     │  │   Manager    │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │                                                             │  │
│  │         State Management (Zustand) + WebSocket Client      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                         HTTP / WS                                │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  NODE.JS BACKEND (Express)                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │     API      │  │   WebSocket  │  │    SQLite    │    │  │
│  │  │   Routes     │  │   Server     │  │      DB      │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Export     │  │    Image     │  │     Cache    │    │  │
│  │  │   Service    │  │   Service    │  │   Manager    │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                         HTTP API                                 │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    EXTERNAL AI SERVICES                    │  │
│  │                      (Localhost APIs)                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   Ollama     │  │    SD WebUI  │  │LibreTranslate│    │  │
│  │  │   :11434     │  │    :7860     │  │    :5000     │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   EXTERNAL UTILITIES                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │   FFmpeg     │  │   eSpeak     │  │  Whisper.cpp │    │  │
│  │  │  (Process)   │  │  (Process)   │  │  (Process)   │    │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Implementation Approach

### 3.1 Core Architecture Patterns

**Monorepo Structure:**
```
presentation-app/
├── packages/
│   ├── frontend/          # React app
│   ├── backend/           # Express server
│   ├── electron/          # Electron wrapper
│   └── shared/            # Shared types/utils
├── services/
│   ├── setup-ollama/      # Setup scripts
│   ├── setup-sd/          # Stable Diffusion setup
│   └── setup-translate/   # LibreTranslate setup
└── scripts/               # Build and install scripts
```

**Data Flow:**
1. User interacts with React UI
2. Actions dispatched to Zustand store
3. Store syncs with backend via REST API
4. Backend persists to SQLite, processes requests
5. AI services called on-demand (cached responses)
6. Real-time updates via WebSocket for collaboration

**Performance Strategy:**
- Virtual scrolling for slide thumbnails (react-window)
- Lazy loading of slide content
- Web Workers for heavy computations (export, image processing)
- IndexedDB for client-side caching of assets
- Debouncing/throttling for real-time updates
- WASM modules for performance-critical operations

### 3.2 AI Integration Strategy

**LLM (Ollama):**
- Run Ollama as separate service on :11434
- API calls from backend to generate presentation content
- Structured prompts with JSON output format
- Response caching in SQLite to avoid redundant generation
- Streaming responses for better UX

**Image Generation (Stable Diffusion):**
- Automatic1111 WebUI runs on :7860
- Queue management for batch generation
- Fallback to Google Custom Search API
- Optional: Web scraping with rate limiting

**Translation (LibreTranslate):**
- Self-hosted on :5000
- Auto-detect language, translate on demand
- Cache translations in DB

### 3.3 Animation System

**Timeline Architecture:**
```
Animation {
  id: string
  slideId: string
  elementId: string
  type: 'fade' | 'slide' | 'zoom' | 'rotate' | '3d' | 'particle' | 'custom'
  duration: number
  delay: number
  easing: string
  properties: Record<string, any>
  keyframes?: Keyframe[]
}
```

**Implementation:**
- GSAP for timeline management
- Three.js for 3D transitions
- Custom particle system with Canvas/WebGL
- Animation presets library (AI-suggested)
- Visual timeline editor component

### 3.4 Export System

**PDF Export:**
- Render slides to canvas → jsPDF
- Preserve fonts, images, vector graphics

**PPTX Export:**
- Use PptxGenJS to generate OpenXML
- Map internal format to PPTX objects

**HTML Export:**
- Static HTML with embedded CSS/JS
- Portable, self-contained presentation
- Playback controls

**Video Export:**
- Render each slide frame-by-frame
- Capture animations via Puppeteer
- Encode with FFmpeg to MP4

### 3.5 Multi-Language Support

**Implementation:**
- i18next for UI localization
- Unicode normalization for text input
- RTL detection via `direction` CSS
- Dynamic font loading (Google Fonts fallback)
- Browser's Intl API for formatting

---

## 4. Source Code Structure

### 4.1 Frontend Structure (`packages/frontend/`)

```
src/
├── components/
│   ├── editor/
│   │   ├── Canvas.tsx              # Main editing canvas
│   │   ├── Toolbar.tsx             # Editing tools
│   │   ├── PropertyPanel.tsx       # Element properties
│   │   └── LayerManager.tsx        # Layer hierarchy
│   ├── slides/
│   │   ├── SlideList.tsx           # Thumbnail navigation
│   │   ├── SlidePreview.tsx        # Individual slide preview
│   │   └── SlideView.tsx           # Full slide renderer
│   ├── animations/
│   │   ├── Timeline.tsx            # Animation timeline editor
│   │   ├── AnimationControls.tsx   # Play/pause/scrub
│   │   └── PresetLibrary.tsx       # Animation presets
│   ├── ai/
│   │   ├── AIAssistant.tsx         # Chat interface
│   │   ├── PromptBuilder.tsx       # Guided prompt creation
│   │   └── GeneratedContent.tsx    # AI output preview
│   ├── export/
│   │   ├── ExportDialog.tsx        # Export options UI
│   │   └── ExportProgress.tsx      # Progress indicator
│   └── ui/
│       ├── Button.tsx              # Reusable UI components
│       ├── Modal.tsx
│       └── ...
├── stores/
│   ├── presentationStore.ts        # Main presentation state
│   ├── editorStore.ts              # Editor UI state
│   ├── animationStore.ts           # Animation state
│   └── settingsStore.ts            # User settings
├── services/
│   ├── api.ts                      # Backend API client
│   ├── websocket.ts                # WebSocket client
│   └── exportService.ts            # Client-side export logic
├── utils/
│   ├── fabricUtils.ts              # Fabric.js helpers
│   ├── animationUtils.ts           # GSAP helpers
│   └── formatters.ts               # Data formatters
├── hooks/
│   ├── usePresentation.ts
│   ├── useAnimation.ts
│   └── useAI.ts
├── types/
│   └── index.ts                    # TypeScript definitions
└── App.tsx                         # Root component
```

### 4.2 Backend Structure (`packages/backend/`)

```
src/
├── routes/
│   ├── presentations.ts            # CRUD for presentations
│   ├── slides.ts                   # Slide operations
│   ├── ai.ts                       # AI generation endpoints
│   ├── images.ts                   # Image fetch/generate
│   ├── export.ts                   # Export endpoints
│   └── settings.ts                 # User settings
├── services/
│   ├── aiService.ts                # Ollama integration
│   ├── imageService.ts             # SD + Google Images
│   ├── translationService.ts       # LibreTranslate
│   ├── exportService.ts            # PDF/PPTX/HTML/Video
│   └── cacheService.ts             # Response caching
├── models/
│   ├── Presentation.ts             # SQLite schema
│   ├── Slide.ts
│   ├── Animation.ts
│   └── Cache.ts
├── middleware/
│   ├── errorHandler.ts
│   ├── validation.ts
│   └── passwordProtection.ts       # Optional auth
├── websocket/
│   └── collaborationHandler.ts     # Real-time sync
├── utils/
│   ├── database.ts                 # SQLite connection
│   ├── ffmpeg.ts                   # FFmpeg wrapper
│   └── logger.ts
└── server.ts                       # Express app setup
```

### 4.3 Electron Structure (`packages/electron/`)

```
src/
├── main.ts                         # Main process
├── preload.ts                      # Preload script
└── ipc/
    ├── fileSystem.ts               # File operations
    └── systemInfo.ts               # System utilities
```

### 4.4 Shared Types (`packages/shared/`)

```
src/
├── types/
│   ├── presentation.ts
│   ├── slide.ts
│   ├── element.ts
│   ├── animation.ts
│   ├── export.ts
│   └── ai.ts
└── constants/
    └── config.ts
```

---

## 5. Data Models & API Interfaces

### 5.1 Core Data Models

```typescript
// Presentation
interface Presentation {
  id: string;
  title: string;
  description?: string;
  theme: Theme;
  slides: Slide[];
  settings: PresentationSettings;
  createdAt: string;
  updatedAt: string;
}

// Slide
interface Slide {
  id: string;
  presentationId: string;
  order: number;
  elements: SlideElement[];
  animations: Animation[];
  background: Background;
  notes?: string;
}

// Slide Element
interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'video' | 'chart' | 'code';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  properties: Record<string, any>;
  locked?: boolean;
}

// Animation
interface Animation {
  id: string;
  slideId: string;
  elementId?: string; // null for slide-level animations
  type: AnimationType;
  trigger: 'auto' | 'click' | 'time';
  duration: number;
  delay: number;
  easing: string;
  properties: AnimationProperties;
  keyframes?: Keyframe[];
}

// Theme
interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string;
  };
  fonts: {
    heading: string;
    body: string;
    code: string;
  };
  mode: 'light' | 'dark';
}

// Export Configuration
interface ExportConfig {
  format: 'pdf' | 'pptx' | 'html' | 'video';
  options: {
    quality?: 'low' | 'medium' | 'high';
    includeNotes?: boolean;
    slideRange?: [number, number];
    videoFps?: number;
    videoCodec?: string;
  };
}

// AI Generation Request
interface AIGenerationRequest {
  prompt: string;
  slideCount: number;
  language?: string;
  theme?: string;
  includeImages?: boolean;
  animationLevel?: 'none' | 'basic' | 'advanced';
  options?: {
    temperature?: number;
    model?: string;
  };
}
```

### 5.2 API Endpoints

**Presentations:**
- `GET /api/presentations` - List all presentations
- `GET /api/presentations/:id` - Get presentation details
- `POST /api/presentations` - Create new presentation
- `PUT /api/presentations/:id` - Update presentation
- `DELETE /api/presentations/:id` - Delete presentation

**Slides:**
- `GET /api/presentations/:id/slides` - Get all slides
- `POST /api/presentations/:id/slides` - Add slide
- `PUT /api/slides/:id` - Update slide
- `DELETE /api/slides/:id` - Delete slide
- `POST /api/slides/:id/duplicate` - Duplicate slide

**AI Generation:**
- `POST /api/ai/generate` - Generate presentation from prompt
- `POST /api/ai/enhance-slide` - Enhance existing slide
- `POST /api/ai/suggest-animations` - Get animation suggestions
- `POST /api/ai/generate-image` - Generate image via SD
- `GET /api/ai/models` - List available models

**Images:**
- `POST /api/images/search` - Search images (Google/scraping)
- `POST /api/images/generate` - Generate image via SD
- `POST /api/images/upload` - Upload local image
- `POST /api/images/process` - Apply filters/transformations

**Translation:**
- `POST /api/translate` - Translate text
- `POST /api/translate/presentation` - Translate entire presentation
- `GET /api/translate/languages` - List supported languages

**Export:**
- `POST /api/export/pdf` - Export to PDF
- `POST /api/export/pptx` - Export to PPTX
- `POST /api/export/html` - Export to HTML
- `POST /api/export/video` - Export to video
- `GET /api/export/status/:jobId` - Check export progress

**WebSocket Events:**
- `slide:update` - Slide content changed
- `element:move` - Element position changed
- `animation:add` - Animation added
- `user:cursor` - User cursor position (collaboration)

### 5.3 Database Schema (SQLite)

```sql
CREATE TABLE presentations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL, -- JSON
  settings TEXT NOT NULL, -- JSON
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE slides (
  id TEXT PRIMARY KEY,
  presentation_id TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  elements TEXT NOT NULL, -- JSON array
  animations TEXT NOT NULL, -- JSON array
  background TEXT NOT NULL, -- JSON
  notes TEXT,
  FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE
);

CREATE TABLE cache (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX idx_slides_presentation ON slides(presentation_id);
CREATE INDEX idx_cache_expires ON cache(expires_at);
```

---

## 6. Verification Approach

### 6.1 Development Environment Setup

**Prerequisites:**
- Node.js 18+ (LTS)
- Python 3.10+ (for AI services)
- FFmpeg (for video export)
- Git

**Installation Script:**
```bash
npm run setup:all
# This will:
# 1. Install npm dependencies
# 2. Download and configure Ollama
# 3. Setup Stable Diffusion (optional)
# 4. Setup LibreTranslate
# 5. Initialize SQLite database
# 6. Generate sample data
```

### 6.2 Testing Strategy

**Unit Tests:**
- Frontend: Vitest + React Testing Library
- Backend: Jest + Supertest
- Coverage target: >80%

**Integration Tests:**
- API endpoint testing
- WebSocket communication
- AI service integration
- Export functionality

**E2E Tests:**
- Playwright for critical user flows
- Slide creation, editing, export
- AI generation workflows

**Performance Tests:**
- Load testing with 100+ slide presentations
- Animation performance benchmarks
- Memory leak detection

### 6.3 Validation Commands

```bash
# Linting
npm run lint              # ESLint + Prettier
npm run lint:fix          # Auto-fix issues

# Type checking
npm run typecheck         # TypeScript type validation

# Testing
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report

# Building
npm run build             # Production build
npm run build:electron    # Electron app package

# Running
npm run dev               # Development mode
npm run start             # Production mode
```

### 6.4 Manual Verification Checklist

**Core Features:**
- [ ] Create new presentation
- [ ] Add/edit/delete slides
- [ ] Add text, images, shapes to slides
- [ ] Apply themes and customize colors
- [ ] Drag-and-drop elements
- [ ] Layer management (z-index)
- [ ] Undo/redo functionality

**AI Features:**
- [ ] Generate presentation from prompt
- [ ] Enhance slide with AI suggestions
- [ ] Generate images via Stable Diffusion
- [ ] Translate presentation to different language
- [ ] AI suggests animations based on content

**Animation Features:**
- [ ] Add fade/slide/zoom animations
- [ ] Create 3D transitions
- [ ] Timeline editor for keyframe animations
- [ ] Preview animations in real-time
- [ ] Chain multiple animations

**Export Features:**
- [ ] Export to PDF (preserves layout)
- [ ] Export to PPTX (opens in PowerPoint)
- [ ] Export to HTML (standalone presentation)
- [ ] Export to MP4 video (with animations)

**Performance:**
- [ ] Smooth editing with 100+ slides
- [ ] No lag during real-time collaboration
- [ ] Fast export times (<30s for 50 slides)
- [ ] Responsive UI on low-end hardware

**Edge Cases:**
- [ ] Handle offline mode (no AI services)
- [ ] Graceful degradation when SD fails
- [ ] Recover from corrupted presentation data
- [ ] Handle extremely large images (>10MB)
- [ ] Support non-Latin scripts (Arabic, Chinese, etc.)

---

## 7. Key Technical Challenges & Solutions

### 7.1 Challenge: Local AI Model Performance

**Issue:** LLMs and SD models are resource-intensive.

**Solution:**
- Use quantized models (GGUF format for Llama)
- Implement request queuing with priority
- Show loading states and allow cancellation
- Cache AI responses aggressively
- Offer cloud API fallback (optional)

### 7.2 Challenge: Real-time Collaboration Without Server

**Issue:** True collaboration requires a server.

**Solution:**
- Simulate multi-user with local WebSocket
- Demo mode: Multiple browser tabs sync via localhost
- For real collab: Document as "local network only"
- Alternative: Use WebRTC for peer-to-peer

### 7.3 Challenge: Cross-Platform Compatibility

**Issue:** Different OS have different dependencies.

**Solution:**
- Electron abstracts OS differences
- Include precompiled binaries for FFmpeg
- Conditional imports for OS-specific features
- Comprehensive setup scripts per platform

### 7.4 Challenge: Video Export Quality vs Speed

**Issue:** High-quality video takes too long.

**Solution:**
- Offer quality presets (draft/standard/HD)
- Use GPU acceleration via FFmpeg flags
- Render in background with progress bar
- Allow preview of first few frames

### 7.5 Challenge: Image Generation Ethics/Legality

**Issue:** Web scraping may violate ToS.

**Solution:**
- Primary: Google Custom Search API (requires key)
- Secondary: User-uploaded images
- Tertiary: Stable Diffusion (fully local, legal)
- Clearly document scraping as "experimental"
- Include rate limiting and user-agent rotation

---

## 8. Dependencies & Licensing

### 8.1 Core Dependencies

**Frontend:**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.5.0",
  "tailwindcss": "^3.4.0",
  "fabric": "^5.3.0",
  "gsap": "^3.12.0",
  "three": "^0.160.0",
  "@dnd-kit/core": "^6.1.0",
  "react-window": "^1.8.10",
  "i18next": "^23.7.0",
  "axios": "^1.6.0"
}
```

**Backend:**
```json
{
  "express": "^4.18.0",
  "socket.io": "^4.6.0",
  "better-sqlite3": "^9.3.0",
  "pptxgenjs": "^3.12.0",
  "jspdf": "^2.5.0",
  "puppeteer": "^21.0.0",
  "sharp": "^0.33.0",
  "fluent-ffmpeg": "^2.1.0"
}
```

**AI Services:**
- Ollama (MIT License)
- Stable Diffusion WebUI (AGPL-3.0)
- LibreTranslate (AGPL-3.0)

### 8.2 License Considerations

- Ensure GPL/AGPL components are properly isolated
- Commercial use: Consider LGPL alternatives if needed
- Include LICENSE file with all third-party notices

---

## 9. Performance Optimization Plan

### 9.1 Frontend Optimizations

- **Code Splitting:** Lazy load routes and heavy components
- **Asset Optimization:** Compress images, use WebP format
- **Virtual Rendering:** Only render visible slides
- **Memoization:** React.memo for expensive components
- **Web Workers:** Offload JSON parsing, export generation
- **IndexedDB:** Cache presentation data locally

### 9.2 Backend Optimizations

- **Connection Pooling:** Reuse database connections
- **Response Caching:** Cache AI responses, image searches
- **Stream Processing:** Stream large exports instead of buffering
- **Background Jobs:** Use worker threads for exports
- **Request Debouncing:** Batch rapid updates

### 9.3 AI Service Optimizations

- **Model Selection:** Use smaller models for simple tasks
- **Batch Processing:** Group image generation requests
- **Context Management:** Trim LLM context to essential info
- **Response Streaming:** Stream LLM output token-by-token

---

## 10. Security Considerations

### 10.1 Local Security

- **Optional Password:** Bcrypt-hashed password for app launch
- **File Validation:** Sanitize file uploads (XSS prevention)
- **CSP Headers:** Content Security Policy for Electron
- **SQL Injection:** Use parameterized queries
- **Path Traversal:** Validate file paths in export

### 10.2 Privacy

- **No Telemetry:** Completely offline, no tracking
- **Local Storage Only:** All data in SQLite, no cloud
- **Optional Cloud Features:** Clearly marked, opt-in only

---

## 11. Extensibility & Plugin System

### 11.1 Plugin Architecture

```typescript
interface Plugin {
  name: string;
  version: string;
  init: (app: AppContext) => void;
  components?: Record<string, React.Component>;
  routes?: Route[];
  hooks?: Hook[];
}
```

**Example Plugins:**
- Chart integration (Chart.js, D3.js)
- Video embed (YouTube, Vimeo)
- Code syntax highlighting (Prism, Shiki)
- LaTeX rendering (KaTeX)
- Diagram creation (Mermaid, Excalidraw)

### 11.2 Plugin Loading

- Plugins in `~/.presentation-app/plugins/`
- Hot reload during development
- Plugin marketplace (future feature)

---

## 12. Deployment Strategy

### 12.1 Standalone Web App

**Setup:**
```bash
npm run build
npm run start
# Access at http://localhost:3000
```

**Pros:** Lightweight, easy updates
**Cons:** Requires Node.js runtime

### 12.2 Electron Desktop App

**Build:**
```bash
npm run build:electron
# Outputs to dist/
# Separate builds for Windows/Mac/Linux
```

**Pros:** Native feel, no browser required
**Cons:** Larger package size (~200MB)

#### Windows .exe Installer

**electron-builder Configuration:**
```json
{
  "build": {
    "appId": "com.presentationapp.app",
    "productName": "PresentationApp",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico",
      "publisherName": "PresentationApp"
    },
    "nsis": {
      "oneClick": true,
      "perMachine": true,
      "allowToChangeInstallationDirectory": false,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "PresentationApp",
      "include": "build/installer.nsh",
      "installerIcon": "build/installer.ico",
      "uninstallerIcon": "build/uninstaller.ico"
    }
  }
}
```

**Build Commands:**
```bash
# Windows installer (.exe)
npm run build:win

# Portable version (no installation required)
npm run build:win:portable
```

**Installer Features:**
- One-click installation (no configuration needed)
- Auto-installs to Program Files
- Desktop shortcut created automatically
- Start Menu integration
- Automatic updates support
- Clean uninstallation
- ~250MB total size (includes all dependencies)

### 12.3 Docker Container

**Dockerfile:**
```dockerfile
FROM node:18-alpine
# Include all AI services
# Pre-download models
# Expose ports
```

**Pros:** Isolated environment, easy distribution
**Cons:** Requires Docker knowledge

---

## 13. Future Enhancements

### 13.1 Advanced Features

- **Voice Control:** Whisper for voice commands
- **Gesture Control:** Webcam-based gesture recognition
- **AR/VR Support:** WebXR for immersive presentations
- **Real-time Analytics:** Track viewer engagement
- **Cloud Sync (Optional):** E2E encrypted cloud backup

### 13.2 AI Improvements

- **Fine-tuned Models:** Custom-trained for presentations
- **Multi-modal AI:** GPT-4V equivalent for image understanding
- **Voice Cloning:** ElevenLabs-style TTS
- **Live Transcription:** Real-time captions during presentation

### 13.3 Collaboration

- **Network Sync:** LAN-based collaboration
- **Version Control:** Git-like branching for presentations
- **Comments & Reviews:** Inline feedback system

---

## Conclusion

This specification provides a comprehensive blueprint for building a feature-rich, local presentation application that rivals and exceeds Slides.com. The architecture prioritizes modularity, performance, and extensibility while maintaining full offline capability. The implementation will be broken down into incremental milestones in the detailed implementation plan.
