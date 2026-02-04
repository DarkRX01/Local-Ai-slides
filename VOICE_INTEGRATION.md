# Voice and TTS Integration

## Overview
This document describes the voice command and text-to-speech integration implemented for the Slides Clone application.

## Features Implemented

### 1. Backend Services

#### Voice Service (`packages/backend/src/services/voiceService.ts`)
- **Speech-to-Text (STT)**: Audio transcription using Whisper
- **Voice Command Parsing**: Natural language command interpretation
- **Text-to-Speech (TTS)**: Audio generation using eSpeak-ng
- **Voice-over Management**: Generate and manage slide voice-overs
- **Multi-language Support**: 12+ languages supported
- **Audio Processing**: Mock audio generation for development/testing

#### Voice Routes (`packages/backend/src/routes/voice.ts`)
- `POST /api/voice/transcribe` - Transcribe audio to text
- `POST /api/voice/command` - Parse voice command
- `POST /api/voice/tts` - Generate speech from text
- `POST /api/voice/voiceover` - Generate voice-over for slide
- `GET /api/voice/voiceover/:slideId` - Get voice-over for slide
- `DELETE /api/voice/voiceover/:slideId` - Delete voice-over
- `GET /api/voice/voiceovers/:filename` - Serve audio file
- `GET /api/voice/voices` - List available voices
- `POST /api/voice/cleanup` - Cleanup temporary files

### 2. Frontend Components

#### Voice Store (`packages/frontend/src/store/voiceStore.ts`)
State management for voice features:
- Voice command listening
- Audio transcription
- Speech synthesis
- Voice-over cache management
- Settings management

#### UI Components

**VoiceCommand** (`packages/frontend/src/components/voice/VoiceCommand.tsx`)
- Floating voice command interface
- Real-time audio recording
- Transcript display
- Command execution feedback

**VoiceSettings** (`packages/frontend/src/components/voice/VoiceSettings.tsx`)
- Enable/disable voice features
- Language selection
- Voice selection
- Speed and pitch controls
- Auto-generate voice-overs toggle

**VoiceOverPanel** (`packages/frontend/src/components/voice/VoiceOverPanel.tsx`)
- Generate voice-overs for slides
- Play/pause voice-over playback
- Delete voice-overs
- Custom text input

**PresentationMode** (`packages/frontend/src/components/presentation/PresentationMode.tsx`)
- Presentation viewer with voice-over support
- Auto-play voice-overs
- Keyboard navigation
- Speaker notes display

### 3. Voice Commands Supported

**Navigation:**
- "next slide" - Navigate to next slide
- "previous slide" / "go back" - Navigate to previous slide
- "first slide" / "go to start" - Navigate to first slide
- "last slide" / "go to end" - Navigate to last slide
- "go to slide [number]" - Navigate to specific slide

**Slide Management:**
- "create slide" / "new slide" - Create new slide
- "delete slide" / "remove slide" - Delete current slide

**Export:**
- "export to pdf" - Export presentation as PDF
- "export to powerpoint" / "export to pptx" - Export as PPTX

**Theme:**
- "dark mode" / "dark theme" - Switch to dark mode
- "light mode" / "light theme" - Switch to light mode

### 4. Supported Languages

- English (en-us, en-gb)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Chinese (zh)
- Japanese (ja)
- Arabic (ar)
- Hindi (hi)

## Database Schema

**slide_voiceovers Table:**
```sql
CREATE TABLE slide_voiceovers (
  id TEXT PRIMARY KEY,
  slide_id TEXT NOT NULL,
  audio_path TEXT NOT NULL,
  duration INTEGER NOT NULL,
  language TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (slide_id) REFERENCES slides(id) ON DELETE CASCADE
);
```

## Configuration

**Environment Variables** (`.env`):
```
WHISPER_MODEL_PATH=../../data/models/whisper
VOICE_STORAGE_PATH=../../data/voiceovers
ESPEAK_ENABLED=true
```

## Dependencies

**Backend:**
- `whisper-node` - Whisper.cpp bindings for Node.js
- `espeak-ng` - Text-to-speech synthesis
- `multer` - File upload handling

**Frontend:**
- Browser MediaRecorder API for audio recording
- HTML5 Audio API for playback

## Testing

### Backend Tests (`packages/backend/src/services/__tests__/voiceService.test.ts`)
- Audio transcription (buffer and base64)
- Voice command parsing
- Speech generation
- Available voices listing
- Cleanup operations

### Frontend Tests (`packages/frontend/src/store/__tests__/voiceStore.test.ts`)
- Settings management
- Voice loading
- Audio transcription
- Command parsing
- Speech generation
- Voice-over management
- Cache operations
- Listening controls

## Usage

### Enable Voice Commands
1. Open settings
2. Navigate to Voice Settings
3. Toggle "Enable Voice Commands"
4. Select preferred language and voice
5. Adjust speed and pitch as needed

### Use Voice Commands
1. Click the microphone button (floating bottom-right)
2. Speak your command
3. Wait for transcription and execution
4. View feedback in the command panel

### Generate Voice-overs
1. Open slide property panel
2. Click "Generate Voice-over"
3. Optionally provide custom text
4. Click "Generate"
5. Play the voice-over with the play button

### Presentation Mode with Voice-overs
1. Enter presentation mode
2. Toggle "Auto-play Voice" to enable/disable automatic playback
3. Voice-overs will play automatically when navigating slides
4. Use arrow keys or voice commands to navigate

## Architecture

```
┌─────────────────────────────────────────┐
│           Frontend                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  VoiceCommand Component         │   │
│  │  - MediaRecorder                │   │
│  │  - Audio Recording              │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  Voice Store (Zustand)          │   │
│  │  - State Management             │   │
│  │  - Cache Management             │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  API Client                     │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼───────────────────────────┘
              │ HTTP/REST
┌─────────────▼───────────────────────────┐
│           Backend                       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Voice Routes (Express)         │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  Voice Service                  │   │
│  │  - Whisper Integration          │   │
│  │  - eSpeak Integration           │   │
│  │  - Command Parser               │   │
│  │  - Audio File Management        │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
│  ┌──────────▼──────────────────────┐   │
│  │  SQLite Database                │   │
│  │  - slide_voiceovers table       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Future Enhancements

- Real Whisper.cpp integration (currently mocked)
- Real eSpeak-ng integration (currently mocked for missing binary)
- Custom wake word support
- Voice command history
- Voice profile customization
- Background noise cancellation
- Speaker diarization for collaborative mode
- Voice command shortcuts customization
- Export voice-overs as separate audio files
- Batch voice-over generation
- Voice cloning support
