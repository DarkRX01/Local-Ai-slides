# API Documentation

Complete API reference for the Presentation App backend server.

**Base URL**: `http://localhost:3001/api`

## Table of Contents

- [Authentication](#authentication)
- [Presentations](#presentations)
- [Slides](#slides)
- [AI Generation](#ai-generation)
- [Images](#images)
- [Translation](#translation)
- [Export](#export)
- [Settings](#settings)
- [Voice](#voice)

---

## Authentication

Currently, authentication is optional. To enable password protection:

1. Set `PASSWORD_PROTECTION=true` in `.env`
2. Set `APP_PASSWORD=your-password` in `.env`
3. Include `Authorization: Bearer <password>` header in requests

---

## Presentations

### List All Presentations

```http
GET /api/presentations
```

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "My Presentation",
    "description": "Optional description",
    "theme": {
      "colors": {
        "primary": "#3B82F6",
        "secondary": "#10B981",
        "accent": "#F59E0B",
        "background": "#FFFFFF",
        "text": "#1F2937"
      },
      "fonts": {
        "heading": "Inter",
        "body": "Inter"
      },
      "mode": "light"
    },
    "settings": {
      "slideSize": { "width": 1920, "height": 1080 },
      "aspectRatio": "16:9",
      "autoSave": true,
      "autoSaveInterval": 30000
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Presentation by ID

```http
GET /api/presentations/:id
```

**Response**: Single presentation object (same structure as above)

**Errors**:
- `404` - Presentation not found

### Create Presentation

```http
POST /api/presentations
```

**Request Body**:
```json
{
  "title": "New Presentation",
  "description": "Optional description",
  "theme": {
    "colors": {
      "primary": "#3B82F6"
    },
    "mode": "dark"
  },
  "settings": {
    "aspectRatio": "16:9",
    "autoSave": true
  }
}
```

**Response**: `201 Created` with presentation object

### Update Presentation

```http
PUT /api/presentations/:id
```

**Request Body**: Partial presentation object (only fields to update)

**Response**: Updated presentation object

**Errors**:
- `404` - Presentation not found

### Delete Presentation

```http
DELETE /api/presentations/:id
```

**Response**: `204 No Content`

**Errors**:
- `404` - Presentation not found

---

## Slides

### Get Slides for Presentation

```http
GET /api/slides/presentation/:presentationId
```

**Response**:
```json
[
  {
    "id": "uuid",
    "presentationId": "uuid",
    "order": 0,
    "elements": [],
    "animations": [],
    "background": {
      "type": "color",
      "color": "#FFFFFF"
    },
    "notes": "Optional speaker notes"
  }
]
```

### Get Slide by ID

```http
GET /api/slides/:id
```

**Response**: Single slide object

**Errors**:
- `404` - Slide not found

### Create Slide

```http
POST /api/slides
```

**Request Body**:
```json
{
  "presentationId": "uuid",
  "order": 0,
  "background": {
    "type": "gradient",
    "gradient": {
      "type": "linear",
      "colors": ["#3B82F6", "#10B981"],
      "angle": 45
    }
  },
  "notes": "Speaker notes"
}
```

**Response**: `201 Created` with slide object

### Update Slide

```http
PUT /api/slides/:id
```

**Request Body**: Partial slide object

**Response**: Updated slide object

**Errors**:
- `404` - Slide not found

### Delete Slide

```http
DELETE /api/slides/:id
```

**Response**: `204 No Content`

**Errors**:
- `404` - Slide not found

### Reorder Slides

```http
POST /api/slides/reorder
```

**Request Body**:
```json
{
  "presentationId": "uuid",
  "slides": [
    { "id": "uuid1", "order": 0 },
    { "id": "uuid2", "order": 1 }
  ]
}
```

**Response**: `{ "success": true }`

---

## AI Generation

### Check AI Service Health

```http
GET /api/ai/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### List Available Models

```http
GET /api/ai/models
```

**Response**:
```json
{
  "models": [
    {
      "name": "llama3",
      "size": "7B"
    },
    {
      "name": "mistral",
      "size": "7B"
    }
  ]
}
```

### Generate Presentation

```http
POST /api/ai/generate
```

**Request Body**:
```json
{
  "prompt": "Create a presentation about AI ethics",
  "slideCount": 10,
  "language": "en",
  "theme": "professional",
  "includeImages": true,
  "animationLevel": "advanced",
  "options": {
    "temperature": 0.7,
    "model": "llama3"
  }
}
```

**Response**:
```json
{
  "presentation": {
    "title": "AI Ethics",
    "slides": [
      {
        "title": "Introduction",
        "content": "...",
        "layout": "title-slide"
      }
    ]
  },
  "metadata": {
    "model": "llama3",
    "processingTime": 5234
  }
}
```

### Generate Text (Streaming)

```http
POST /api/ai/generate/stream
```

**Request Body**:
```json
{
  "prompt": "Write an introduction about AI",
  "model": "llama3",
  "temperature": 0.7
}
```

**Response**: Server-Sent Events stream
```
data: {"chunk": "Artificial"}
data: {"chunk": " Intelligence"}
data: [DONE]
```

### Generate Text (Non-streaming)

```http
POST /api/ai/text
```

**Request Body**:
```json
{
  "prompt": "Write a brief introduction",
  "model": "llama3",
  "temperature": 0.7
}
```

**Response**:
```json
{
  "text": "Artificial Intelligence is..."
}
```

### Enhance Slide

```http
POST /api/ai/enhance
```

**Request Body**:
```json
{
  "slideId": "uuid",
  "type": "content",
  "context": "Make it more engaging"
}
```

**Types**: `content`, `layout`, `animations`

**Response**:
```json
{
  "suggestions": {
    "title": "Enhanced Title",
    "content": "Enhanced content..."
  }
}
```

### Suggest Animations

```http
POST /api/ai/suggest-animations/:slideId
```

**Request Body**:
```json
{
  "context": "Make it dramatic"
}
```

**Response**:
```json
{
  "animations": [
    {
      "elementId": "text-1",
      "type": "fade",
      "duration": 1000,
      "delay": 0
    }
  ]
}
```

---

## Images

### Check Image Service Health

```http
GET /api/images/health
```

**Response**:
```json
{
  "stableDiffusion": true,
  "googleSearch": true
}
```

### Generate Image (Stable Diffusion)

```http
POST /api/images/generate
```

**Request Body**:
```json
{
  "prompt": "A cat in space, digital art",
  "negativePrompt": "blurry, low quality",
  "width": 512,
  "height": 512,
  "steps": 30,
  "cfgScale": 7.5
}
```

**Response**:
```json
{
  "jobId": "uuid"
}
```

### Get Generation Job Status

```http
GET /api/images/job/:jobId
```

**Response**:
```json
{
  "id": "uuid",
  "status": "completed",
  "progress": 100,
  "imageUrl": "/api/images/file/generated_xyz.png",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status values**: `pending`, `processing`, `completed`, `failed`

### Search Google Images

```http
GET /api/images/search/google?q=cats&count=10
```

**Query Parameters**:
- `q` (required) - Search query
- `count` (optional) - Number of results (1-10, default: 10)

**Response**:
```json
{
  "results": [
    {
      "url": "https://...",
      "title": "Cat image",
      "thumbnail": "https://..."
    }
  ]
}
```

**Note**: Requires `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` in `.env`

### Scrape Images

```http
GET /api/images/search/scrape?q=cats&count=10
```

**Query Parameters**:
- `q` (required) - Search query
- `count` (optional) - Number of results (1-20, default: 10)

**Response**: Same as Google Images

### Download Image from URL

```http
POST /api/images/download
```

**Request Body**:
```json
{
  "url": "https://example.com/image.jpg"
}
```

**Response**:
```json
{
  "filename": "image_xyz.jpg",
  "url": "/api/images/file/image_xyz.jpg"
}
```

### Process Image

```http
POST /api/images/process
```

**Request Body**:
```json
{
  "filename": "image.jpg",
  "resize": {
    "width": 800,
    "height": 600
  },
  "compress": true,
  "format": "webp",
  "quality": 80,
  "filters": {
    "grayscale": false,
    "blur": 2,
    "sharpen": true,
    "rotate": 90
  }
}
```

**Response**:
```json
{
  "filename": "image_processed.webp",
  "url": "/api/images/file/image_processed.webp"
}
```

### Remove Background

```http
POST /api/images/remove-background
```

**Request Body**:
```json
{
  "filename": "image.jpg"
}
```

**Response**:
```json
{
  "filename": "image_nobg.png",
  "url": "/api/images/file/image_nobg.png"
}
```

### Compress Image

```http
POST /api/images/compress
```

**Request Body**:
```json
{
  "filename": "large_image.jpg",
  "maxSizeMB": 5
}
```

**Response**:
```json
{
  "filename": "large_image_compressed.jpg",
  "url": "/api/images/file/large_image_compressed.jpg",
  "compressed": true
}
```

### Upload Image

```http
POST /api/images/upload
```

**Request Body**:
```json
{
  "image": "data:image/png;base64,iVBORw0KGg..."
}
```

**Response**:
```json
{
  "filename": "upload_1234567890.png",
  "url": "/api/images/file/upload_1234567890.png"
}
```

### Get Image File

```http
GET /api/images/file/:filename
```

**Response**: Binary image data

---

## Translation

### Get Available Languages

```http
GET /api/translation/languages
```

**Response**:
```json
{
  "languages": [
    { "code": "en", "name": "English" },
    { "code": "es", "name": "Spanish" },
    { "code": "fr", "name": "French" }
  ]
}
```

### Detect Language

```http
POST /api/translation/detect
```

**Request Body**:
```json
{
  "text": "Bonjour le monde"
}
```

**Response**:
```json
{
  "language": "fr",
  "confidence": 0.95
}
```

### Translate Text

```http
POST /api/translation/translate
```

**Request Body**:
```json
{
  "text": "Hello world",
  "targetLanguage": "es",
  "sourceLanguage": "en"
}
```

**Response**:
```json
{
  "translatedText": "Hola mundo",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

### Translate Batch

```http
POST /api/translation/translate/batch
```

**Request Body**:
```json
{
  "texts": ["Hello", "World", "How are you?"],
  "targetLanguage": "fr",
  "sourceLanguage": "en"
}
```

**Response**:
```json
{
  "translations": ["Bonjour", "Monde", "Comment allez-vous?"],
  "sourceLanguage": "en",
  "targetLanguage": "fr"
}
```

### Translate Slide

```http
POST /api/translation/translate/slide/:slideId
```

**Request Body**:
```json
{
  "targetLanguage": "es",
  "sourceLanguage": "en"
}
```

**Response**:
```json
{
  "slide": {
    "id": "uuid",
    "elements": []
  },
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

### Translate Presentation

```http
POST /api/translation/translate/presentation/:presentationId
```

**Request Body**:
```json
{
  "targetLanguage": "fr",
  "sourceLanguage": "en"
}
```

**Response**:
```json
{
  "presentationId": "uuid",
  "translatedSlides": 10,
  "sourceLanguage": "en",
  "targetLanguage": "fr"
}
```

### Clear Translation Cache

```http
DELETE /api/translation/cache
```

**Response**:
```json
{
  "message": "Translation cache cleared successfully"
}
```

### Clear Expired Cache

```http
DELETE /api/translation/cache/expired
```

**Response**:
```json
{
  "message": "Expired translation cache entries cleared successfully"
}
```

---

## Export

### Export to PDF

```http
POST /api/export/pdf
```

**Request Body**:
```json
{
  "presentationId": "uuid",
  "config": {
    "format": "pdf",
    "options": {
      "quality": "high",
      "includeNotes": true,
      "slideRange": [0, 5]
    }
  }
}
```

**Response**: `202 Accepted`
```json
{
  "id": "job-uuid",
  "status": "pending",
  "format": "pdf",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Export to PPTX

```http
POST /api/export/pptx
```

**Request Body**: Same structure as PDF export

**Response**: `202 Accepted` with job object

### Export to HTML

```http
POST /api/export/html
```

**Request Body**: Same structure as PDF export

**Response**: `202 Accepted` with job object

### Export to Video

```http
POST /api/export/video
```

**Request Body**:
```json
{
  "presentationId": "uuid",
  "config": {
    "format": "video",
    "options": {
      "quality": "high",
      "videoFps": 30,
      "videoCodec": "h264"
    }
  }
}
```

**Response**: `202 Accepted` with job object

### Get Export Job Status

```http
GET /api/export/status/:jobId
```

**Response**:
```json
{
  "id": "uuid",
  "status": "completed",
  "format": "pdf",
  "progress": 100,
  "filePath": "/path/to/export.pdf",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "completedAt": "2024-01-01T00:01:00.000Z"
}
```

**Status values**: `pending`, `processing`, `completed`, `failed`

### List All Export Jobs

```http
GET /api/export/jobs
```

**Response**:
```json
[
  {
    "id": "uuid",
    "status": "completed",
    "format": "pdf"
  }
]
```

### Download Export

```http
GET /api/export/download/:jobId
```

**Response**: Binary file download

**Errors**:
- `404` - Job not found or file not available
- `400` - Export not completed

### Delete Export Job

```http
DELETE /api/export/jobs/:jobId
```

**Response**: `204 No Content`

**Errors**:
- `404` - Job not found

---

## Settings

### Get Settings

```http
GET /api/settings
```

**Response**:
```json
{
  "theme": "dark",
  "language": "en",
  "autoSave": true,
  "autoSaveInterval": 30000
}
```

### Update Settings

```http
PUT /api/settings
```

**Request Body**: Partial settings object

**Response**: Updated settings object

---

## Voice

### Check Voice Service Health

```http
GET /api/voice/health
```

**Response**:
```json
{
  "whisper": true,
  "espeak": true
}
```

### Transcribe Audio (Speech-to-Text)

```http
POST /api/voice/transcribe
```

**Request Body**:
```json
{
  "audio": "base64-encoded-audio-data",
  "language": "en"
}
```

**Response**:
```json
{
  "text": "Transcribed text from audio",
  "language": "en",
  "confidence": 0.95
}
```

### Generate Speech (Text-to-Speech)

```http
POST /api/voice/tts
```

**Request Body**:
```json
{
  "text": "Hello world",
  "language": "en",
  "voice": "default",
  "speed": 1.0
}
```

**Response**:
```json
{
  "audioUrl": "/api/voice/audio/generated_xyz.wav"
}
```

### Get Generated Audio

```http
GET /api/voice/audio/:filename
```

**Response**: Binary audio data (WAV format)

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing password"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "Presentation not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Error details..."
}
```

---

## Rate Limiting

- Image scraping: Max 10 requests per minute per IP
- AI generation: Max 5 concurrent requests
- Export jobs: Max 3 concurrent jobs per user

---

## WebSocket Events

Connect to WebSocket server at `ws://localhost:3001`

### Client → Server Events

**join-presentation**
```json
{
  "event": "join-presentation",
  "presentationId": "uuid"
}
```

**leave-presentation**
```json
{
  "event": "leave-presentation",
  "presentationId": "uuid"
}
```

**slide-update**
```json
{
  "event": "slide-update",
  "slideId": "uuid",
  "updates": {
    "elements": []
  }
}
```

### Server → Client Events

**user-joined**
```json
{
  "event": "user-joined",
  "userId": "uuid",
  "presentationId": "uuid"
}
```

**user-left**
```json
{
  "event": "user-left",
  "userId": "uuid",
  "presentationId": "uuid"
}
```

**slide-updated**
```json
{
  "event": "slide-updated",
  "slideId": "uuid",
  "userId": "uuid",
  "updates": {}
}
```

**export-progress**
```json
{
  "event": "export-progress",
  "jobId": "uuid",
  "progress": 50,
  "status": "processing"
}
```

---

## Examples

### Complete Workflow: Create and Export Presentation

1. **Create presentation**
```bash
curl -X POST http://localhost:3001/api/presentations \
  -H "Content-Type: application/json" \
  -d '{"title": "My Presentation"}'
```

2. **Create slides**
```bash
curl -X POST http://localhost:3001/api/slides \
  -H "Content-Type: application/json" \
  -d '{"presentationId": "<id>", "order": 0}'
```

3. **Generate content with AI**
```bash
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create 5 slides about AI", "slideCount": 5}'
```

4. **Export to PDF**
```bash
curl -X POST http://localhost:3001/api/export/pdf \
  -H "Content-Type: application/json" \
  -d '{"presentationId": "<id>", "config": {"format": "pdf"}}'
```

5. **Check export status**
```bash
curl http://localhost:3001/api/export/status/<jobId>
```

6. **Download export**
```bash
curl -O http://localhost:3001/api/export/download/<jobId>
```

---

## Additional Notes

- All timestamps are in ISO 8601 format
- All IDs are UUIDs (v4)
- File uploads are limited to 100MB
- Generated files are stored in `data/exports/` and `data/images/`
- Caching is enabled for AI responses and translations (configurable TTL)
- CORS is enabled for `http://localhost:3000` (frontend)

For more details on specific services, see the source code in `packages/backend/src/services/`.
