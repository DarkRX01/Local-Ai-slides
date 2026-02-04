# User Guide

Complete guide for using the Presentation App to create stunning presentations.

## Table of Contents

- [Getting Started](#getting-started)
- [Creating Presentations](#creating-presentations)
- [Working with Slides](#working-with-slides)
- [AI-Powered Features](#ai-powered-features)
- [Images and Media](#images-and-media)
- [Animations](#animations)
- [Multi-Language Support](#multi-language-support)
- [Exporting](#exporting)
- [Advanced Features](#advanced-features)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Tips and Tricks](#tips-and-tricks)

---

## Getting Started

### First Launch

1. **Start the application**
   ```bash
   npm run dev
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

3. **Verify services** (optional)
   - Check that Ollama is running: `ollama serve`
   - Check LibreTranslate: `docker ps` (should show libretranslate container)

### Application Layout

The application interface consists of four main areas:

1. **Top Bar**: File operations, export, and settings
2. **Left Sidebar**: Slide thumbnails and navigation
3. **Main Canvas**: Slide editing area with drag-and-drop
4. **Right Panel**: Properties, AI assistant, and animations

---

## Creating Presentations

### Creating a New Presentation

1. Click **"New Presentation"** in the top bar
2. Enter a title and optional description
3. Choose a theme:
   - **Light** or **Dark** mode
   - Select color scheme (or customize)
   - Choose fonts
4. Configure settings:
   - **Aspect ratio**: 16:9 (default), 4:3, or custom
   - **Slide size**: 1920x1080 (default) or custom
   - **Auto-save**: Enabled by default

### Using Templates

Start quickly with pre-built templates:

1. Click **"New from Template"**
2. Browse categories (Business, Education, Creative, etc.)
3. Select a template
4. Customize to your needs

### Importing Existing Presentations

Currently supports:
- **PPTX files**: Import PowerPoint presentations
- **JSON**: Import from exported JSON files

```
File → Import → Select file
```

---

## Working with Slides

### Adding Slides

**Method 1: Click button**
- Click **"+"** in the slide thumbnail panel
- Choose slide layout or start blank

**Method 2: Duplicate**
- Right-click any slide → **"Duplicate"**
- Or use keyboard shortcut: `Ctrl+D`

**Method 3: AI Generation**
- Use AI assistant to generate multiple slides at once

### Editing Slide Content

#### Adding Text

1. Click **"Text"** tool in toolbar (or press `T`)
2. Click on canvas to place text box
3. Type your content
4. Customize in property panel:
   - Font family, size, weight
   - Color, alignment
   - Line height, letter spacing

#### Adding Images

**Method 1: Upload**
1. Click **"Image"** tool
2. Click **"Upload"** or drag-and-drop file
3. Position and resize on canvas

**Method 2: Search**
1. Click **"Image"** → **"Search"**
2. Enter search term
3. Select from results
4. Image automatically added to slide

**Method 3: Generate with AI**
1. Click **"Image"** → **"Generate"**
2. Enter description prompt
3. Wait for generation
4. Preview and insert

#### Adding Shapes

1. Click **"Shapes"** tool
2. Select shape type (rectangle, circle, triangle, etc.)
3. Click and drag on canvas
4. Customize:
   - Fill color and opacity
   - Border color and width
   - Rounded corners

#### Adding Charts

1. Click **"Chart"** tool
2. Select chart type (bar, line, pie, etc.)
3. Input data:
   - Manually enter values
   - Import from CSV
   - Connect to data source
4. Customize appearance

### Organizing Elements

#### Layers and Z-Index

- **Bring to Front**: `Ctrl+]` or right-click → "Bring to Front"
- **Send to Back**: `Ctrl+[` or right-click → "Send to Back"
- **Layer Panel**: View and reorder all elements

#### Alignment

Use alignment tools or keyboard shortcuts:
- **Align Left**: `Ctrl+Shift+L`
- **Center Horizontally**: `Ctrl+Shift+C`
- **Distribute Evenly**: `Ctrl+Shift+D`

#### Grouping

1. Select multiple elements (`Shift+Click`)
2. Right-click → **"Group"** or press `Ctrl+G`
3. Edit as single unit
4. **Ungroup**: `Ctrl+Shift+G`

### Slide Navigation

- **Next slide**: `→` or `Page Down`
- **Previous slide**: `←` or `Page Up`
- **Go to slide**: Click thumbnail in sidebar
- **Presentation mode**: Press `F5`

### Reordering Slides

**Method 1: Drag and drop**
- Click and drag thumbnail in sidebar

**Method 2: Cut and paste**
- Right-click slide → **"Cut"**
- Click insertion point → **"Paste"**

---

## AI-Powered Features

### Generating Presentations from Prompts

1. Click **"AI Assistant"** in right panel
2. Click **"Generate Presentation"**
3. Enter detailed prompt:
   ```
   Create a 10-slide presentation about sustainable energy.
   Include:
   - Introduction to renewable sources
   - Solar power benefits
   - Wind energy statistics
   - Future outlook
   Target audience: General public
   Tone: Educational and optimistic
   ```
4. Configure options:
   - **Slide count**: 1-50
   - **Language**: English, Spanish, French, etc.
   - **Theme**: Professional, Creative, Minimal
   - **Include images**: Yes/No
   - **Animation level**: None, Basic, Advanced
5. Click **"Generate"**
6. Review generated slides
7. Edit and customize as needed

### Enhancing Existing Content

**Improve slide content:**
1. Select a slide
2. Click **"AI Assistant"** → **"Enhance Content"**
3. AI suggests improvements:
   - Better phrasing
   - More engaging text
   - Additional bullet points
4. Accept or modify suggestions

**Suggest layouts:**
1. Select slide
2. Click **"Suggest Layout"**
3. AI analyzes content and suggests optimal layout
4. Preview and apply

**Generate speaker notes:**
1. Select slide
2. Click **"Generate Notes"**
3. AI creates detailed speaker notes based on slide content

### Animation Suggestions

1. Select slide or element
2. Click **"Suggest Animations"**
3. AI analyzes content and recommends:
   - Entry animations for text
   - Emphasis for key points
   - Exit animations
   - Transitions between slides
4. Preview suggestions
5. Apply or customize

### Voice Commands

1. Click microphone icon (or press `Ctrl+M`)
2. Speak your command:
   - **"Add new slide"**
   - **"Change background to blue"**
   - **"Add title 'Introduction'"**
   - **"Make text bold"**
   - **"Export to PDF"**
3. Command is executed automatically

---

## Images and Media

### Image Sources

#### Upload Local Images

1. **Drag and drop**: Drag image files directly onto canvas
2. **File browser**: Click **"Upload"** → select files
3. **Paste**: Copy image from clipboard, press `Ctrl+V`

Supported formats: JPG, PNG, GIF, WebP, SVG

#### Search for Images

**Google Image Search:**
1. Click **"Image"** → **"Search"** → **"Google"**
2. Enter search term
3. Browse results with thumbnails
4. Click to insert

**Web Scraping (fallback):**
- Automatically used if Google API unavailable
- Same interface as Google search

#### Generate with AI

**Stable Diffusion:**
1. Click **"Image"** → **"Generate"**
2. Enter detailed prompt:
   ```
   A futuristic city skyline at sunset, cyberpunk style,
   neon lights, high detail, digital art
   ```
3. Optionally add negative prompt:
   ```
   blurry, low quality, distorted
   ```
4. Adjust settings:
   - **Size**: 512x512, 768x768, 1024x1024
   - **Steps**: 20-50 (higher = better quality, slower)
   - **CFG Scale**: 7-12 (how closely to follow prompt)
5. Click **"Generate"**
6. Wait for generation (progress shown)
7. Preview and insert

### Image Editing

#### Basic Adjustments

1. Select image on canvas
2. Open **"Image Tools"** in right panel
3. Adjust:
   - **Brightness**: -100 to +100
   - **Contrast**: -100 to +100
   - **Saturation**: -100 to +100
   - **Opacity**: 0 to 100%

#### Filters

Apply filters with one click:
- **Grayscale**
- **Sepia**
- **Blur**
- **Sharpen**
- **Vintage**
- **High Contrast**

#### Background Removal

1. Select image
2. Click **"Remove Background"**
3. Wait for processing
4. Background becomes transparent
5. Use on any slide background color

#### Cropping and Resizing

- **Crop**: Click **"Crop"**, drag handles, press `Enter`
- **Resize**: Drag corner handles while holding `Shift` (maintains aspect ratio)
- **Rotate**: Use rotation handle or enter angle in property panel

---

## Animations

### Adding Animations

1. Select element on slide
2. Open **"Animations"** panel
3. Click **"+ Add Animation"**
4. Choose animation type:
   - **Entrance**: Fade, Slide, Zoom, Bounce, etc.
   - **Emphasis**: Pulse, Shake, Grow, Spin
   - **Exit**: Fade Out, Slide Out, Shrink
   - **Motion Path**: Custom path animations

5. Configure:
   - **Duration**: 0.1s - 5s
   - **Delay**: 0s - 10s
   - **Easing**: Linear, Ease In/Out, Bounce, Elastic

### Timeline Editor

View and edit all animations on a timeline:

1. Click **"Timeline"** tab
2. See all animations as bars on timeline
3. **Drag bars** to change timing
4. **Resize bars** to adjust duration
5. **Drag keyframes** for custom animation curves

### Advanced Animations

#### 3D Transitions

1. Select slide
2. Choose **"3D Transition"**
3. Select effect:
   - Cube rotation
   - Flip
   - Carousel
   - Zoom through
4. Configure rotation axis and speed

#### Particle Effects

1. Click **"Effects"** → **"Particles"**
2. Choose effect:
   - Confetti
   - Snow
   - Sparkles
   - Fireflies
3. Customize:
   - Particle count
   - Colors
   - Speed and direction
   - Duration

#### Custom Keyframe Animation

For advanced users:

1. Select element
2. Click **"Custom Animation"**
3. Add keyframes at specific times
4. Set properties at each keyframe (position, scale, rotation, opacity)
5. Preview animation
6. Fine-tune easing between keyframes

### Animation Presets

Save time with pre-built animation sequences:

1. Browse **"Animation Library"**
2. Filter by category (Professional, Creative, Playful)
3. Click preset to preview
4. Apply to selected element
5. Customize if needed

---

## Multi-Language Support

### Interface Language

Change application language:

1. Click **Settings** → **Language**
2. Select from 50+ languages
3. Interface updates immediately
4. Preferences saved automatically

### Translating Content

#### Translate Entire Presentation

1. Click **"Translate"** in top bar
2. Select target language
3. Choose translation options:
   - Translate all slides
   - Translate specific slides
   - Translate text only (keep images)
4. Click **"Translate"**
5. Review translated slides
6. Manual edits preserved

#### Translate Individual Slides

1. Right-click slide thumbnail
2. Select **"Translate Slide"**
3. Choose target language
4. Slide content updated

#### Translate Text Elements

1. Select text element
2. Right-click → **"Translate"**
3. Choose language
4. Text updated in-place

### RTL Language Support

Automatic support for right-to-left languages (Arabic, Hebrew, etc.):

- Text alignment automatically adjusts
- Element positioning mirrors
- Animation directions flip appropriately

### Font Handling

Application automatically loads fonts for:
- Latin scripts
- Cyrillic
- Chinese (Simplified and Traditional)
- Japanese
- Korean
- Arabic
- Hebrew
- Indic scripts (Hindi, Bengali, etc.)

---

## Exporting

### Export Formats

#### PDF Export

**Best for**: Printing, sharing read-only versions

1. Click **"Export"** → **"PDF"**
2. Configure options:
   - **Quality**: Draft, Standard, High
   - **Include speaker notes**: Yes/No
   - **Page range**: All slides or specific range
3. Click **"Export"**
4. Wait for processing
5. Download PDF file

**Features**:
- Preserves fonts and layout
- Embeds images
- Clickable links
- Bookmarks for navigation

#### PowerPoint (PPTX) Export

**Best for**: Editing in PowerPoint, compatibility

1. Click **"Export"** → **"PowerPoint"**
2. Configure:
   - Compatibility version (2010, 2013, 2016, 2019)
   - Include animations: Yes/No
   - Include notes: Yes/No
3. Export and download

**Note**: Complex animations may be simplified for compatibility.

#### HTML Export

**Best for**: Web publishing, interactive presentations

1. Click **"Export"** → **"HTML"**
2. Configure:
   - Standalone (single file) or multi-file
   - Include navigation controls
   - Auto-play slides
   - Keyboard controls
3. Export creates `.html` file(s)
4. Open in any web browser

**Features**:
- Fully responsive
- Works offline
- Preserves animations
- Touch-friendly navigation

#### Video Export

**Best for**: YouTube, social media, automated playback

1. Click **"Export"** → **"Video"**
2. Configure:
   - **Resolution**: 720p, 1080p, 4K
   - **Frame rate**: 24, 30, 60 fps
   - **Codec**: H.264 (compatible), H.265 (smaller file)
   - **Quality**: Low, Medium, High, Lossless
3. Set slide timing:
   - **Auto**: Based on animations
   - **Fixed**: Same duration for all slides
   - **Custom**: Set duration per slide
4. Start export
5. Monitor progress
6. Download MP4 file

**Note**: Video export can take several minutes for long presentations.

### Export Progress

Monitor exports in real-time:

1. Click **"Exports"** in top bar
2. View all export jobs:
   - Status (pending, processing, completed)
   - Progress percentage
   - Estimated time remaining
3. Download completed exports
4. Cancel pending exports

### Batch Export

Export to multiple formats at once:

1. Click **"Export"** → **"Batch Export"**
2. Select formats (PDF + PPTX + HTML, etc.)
3. Configure each format
4. Start batch export
5. All files download when ready

---

## Advanced Features

### Themes and Branding

#### Creating Custom Themes

1. Click **Settings** → **Themes** → **"Create Theme"**
2. Define:
   - Color palette (primary, secondary, accent, etc.)
   - Typography (heading and body fonts)
   - Default layouts
   - Background styles
3. Save theme
4. Apply to presentations

#### Brand Kit

Store brand assets for quick access:

1. Create **"Brand Kit"** in settings
2. Upload:
   - Logo(s)
   - Brand colors (with hex codes)
   - Fonts
   - Image assets
3. Access in editor via **"Brand Assets"** panel

### Collaboration (Local Simulation)

Simulate multi-user editing on same device:

1. Open presentation in multiple browser tabs
2. Changes sync via WebSocket
3. See cursor positions of other "users"
4. Conflicts automatically resolved

**Note**: True remote collaboration requires server configuration.

### Presenter Mode

Run presentations professionally:

1. Press `F5` or click **"Present"**
2. Presenter view shows:
   - Current slide (main display)
   - Next slide preview
   - Speaker notes
   - Timer
   - Slide navigation
3. Audience sees only slides
4. Control playback:
   - Click to advance
   - Arrow keys to navigate
   - `Escape` to exit

### Voice-Over Recording

Add narration to slides:

1. Select slide
2. Click **"Voice-Over"** → **"Record"**
3. Speak into microphone
4. Click **"Stop"** when finished
5. Audio attached to slide
6. Play during presentation

**Export with voice-over**:
- HTML export includes audio playback
- Video export embeds audio

### Charts and Data Visualization

#### Creating Charts

1. Click **"Chart"** tool
2. Select type:
   - **Bar/Column**: Compare values
   - **Line**: Show trends over time
   - **Pie/Donut**: Show proportions
   - **Scatter**: Show correlations
   - **Area**: Show cumulative values
3. Input data:
   ```
   Category A: 30
   Category B: 45
   Category C: 25
   ```
4. Customize:
   - Colors matching theme
   - Labels and legend
   - Axes and gridlines
   - Animations

#### Live Data Connection

Connect charts to live data sources (advanced):

1. Create chart
2. Click **"Data Source"** → **"Connect"**
3. Choose source type:
   - CSV file (auto-refresh)
   - JSON API endpoint
   - Google Sheets (requires API key)
4. Data updates automatically

### Code Blocks

Display code with syntax highlighting:

1. Click **"Code"** tool
2. Select language (JavaScript, Python, Java, etc.)
3. Paste or type code
4. Choose theme (Dark, Light, Monokai, etc.)
5. Toggle line numbers and highlighting

---

## Keyboard Shortcuts

### General

- `Ctrl+N` - New presentation
- `Ctrl+O` - Open presentation
- `Ctrl+S` - Save
- `Ctrl+Shift+S` - Save as
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Ctrl+F` - Find
- `F5` - Start presentation
- `Escape` - Exit presentation mode

### Editing

- `Ctrl+C` - Copy
- `Ctrl+X` - Cut
- `Ctrl+V` - Paste
- `Ctrl+D` - Duplicate
- `Delete` - Delete selected
- `Ctrl+A` - Select all
- `Ctrl+G` - Group elements
- `Ctrl+Shift+G` - Ungroup

### Slide Navigation

- `Ctrl+Enter` - New slide after current
- `Page Up` - Previous slide
- `Page Down` - Next slide
- `Home` - First slide
- `End` - Last slide

### Text Editing

- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+U` - Underline
- `Ctrl+L` - Align left
- `Ctrl+E` - Align center
- `Ctrl+R` - Align right

### Tools

- `T` - Text tool
- `I` - Image tool
- `S` - Shape tool
- `V` - Selection tool
- `H` - Hand tool (pan canvas)
- `Z` - Zoom tool

### View

- `Ctrl++` - Zoom in
- `Ctrl+-` - Zoom out
- `Ctrl+0` - Reset zoom
- `Ctrl+1` - Fit slide to window
- `Ctrl+2` - Actual size

---

## Tips and Tricks

### Productivity Tips

1. **Use templates** - Start with templates instead of blank slides
2. **Keyboard shortcuts** - Learn 10-15 most used shortcuts
3. **AI generation** - Let AI create first draft, then refine
4. **Duplicate slides** - Copy similar slides and modify
5. **Master slides** - Define common elements once
6. **Snap to grid** - Enable grid for perfect alignment
7. **Save regularly** - Auto-save is great, manual saves are better

### Design Best Practices

1. **Consistency** - Use same fonts, colors throughout
2. **Contrast** - Ensure text readable on backgrounds
3. **White space** - Don't overcrowd slides
4. **Visual hierarchy** - Most important info largest/boldest
5. **Limit fonts** - 2-3 font families maximum
6. **Color palette** - Stick to 3-5 colors
7. **High-quality images** - Avoid pixelated images

### Animation Guidelines

1. **Less is more** - Don't animate everything
2. **Consistent timing** - Use same durations throughout
3. **Purpose-driven** - Animate to emphasize, not distract
4. **Test on different devices** - Ensure smooth playback
5. **Consider audience** - Formal presentations need subtle animations

### AI Prompting Tips

**Be specific**:
```
❌ Create presentation about marketing
✅ Create 8-slide presentation about social media marketing strategies
   for small businesses. Include case studies, statistics, and actionable tips.
```

**Provide context**:
```
Audience: College students
Tone: Casual and humorous
Goal: Introduce concept of cryptocurrency
```

**Iterate**:
- Generate initial version
- Use "Enhance" for improvements
- Regenerate individual slides as needed

### Performance Optimization

1. **Compress large images** - Use built-in compression
2. **Limit animations** - Too many can slow down
3. **Use vector shapes** - Instead of raster images when possible
4. **Clear cache** - Settings → Clear Cache (if app feels slow)
5. **Close unused tabs** - If running in browser

### Troubleshooting Common Issues

**Slides not appearing:**
- Refresh page
- Check browser console for errors
- Verify backend is running

**AI not working:**
- Ensure Ollama is running: `ollama serve`
- Check model is downloaded: `ollama list`
- Try different model in settings

**Export failing:**
- Check disk space
- Verify FFmpeg installed (for video export)
- Try lower quality settings
- Check export logs in `data/exports/logs/`

**Slow performance:**
- Reduce number of animations
- Compress images
- Close other applications
- Use Chrome or Edge (best performance)

---

## Getting Help

### Resources

- **README.md** - Installation and setup
- **API.md** - Backend API reference
- **PLUGIN_DEVELOPMENT.md** - Plugin creation guide
- **GitHub Issues** - Report bugs and request features

### Support

For issues and questions:
1. Check troubleshooting section above
2. Review logs in `data/logs/`
3. Open issue on GitHub with:
   - Steps to reproduce
   - Expected vs actual behavior
   - System info (OS, Node version)
   - Relevant logs

---

**Enjoy creating amazing presentations!** 🎉
