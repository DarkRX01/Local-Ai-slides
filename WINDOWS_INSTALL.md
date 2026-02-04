# 🪟 Windows Installation Guide

## Super Simple Installation (Recommended)

### Download & Install in 3 Steps

**1. Download the Installer**
- Go to the [Releases](https://github.com/YOUR_USERNAME/slides-clone/releases) page
- Download `Slides-Clone-Setup-1.0.0.exe` (latest version)
- File size: ~250 MB

**2. Run the Installer**
- Double-click the downloaded `.exe` file
- Click **"Yes"** if Windows asks for permission
- The installer will automatically:
  - Install to `C:\Program Files\Slides Clone`
  - Create a desktop shortcut
  - Add to Start Menu
  - Launch the app when done

**3. You're Done! 🎉**
- The app will open automatically
- Find it anytime via:
  - Desktop shortcut
  - Start Menu → "Slides Clone"
  - Search Windows for "Slides Clone"

---

## Portable Version (No Installation)

**Perfect for USB drives or when you don't have admin rights**

1. Download `SlidesClone-Portable-1.0.0.exe` from [Releases](https://github.com/YOUR_USERNAME/slides-clone/releases)
2. Put it anywhere (Desktop, USB drive, folder, etc.)
3. Double-click to run
4. No installation needed - all data saved in the same folder

---

## System Requirements

### Minimum
- **OS**: Windows 10 (64-bit) or Windows 11
- **RAM**: 4 GB
- **Storage**: 500 MB free space
- **Processor**: Intel Core i3 or equivalent

### Recommended (for AI features)
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 16 GB
- **Storage**: 10 GB free space (for AI models)
- **Processor**: Intel Core i5 or AMD Ryzen 5
- **GPU**: NVIDIA GTX 1060 or better (for image generation)

---

## First Launch Setup

### Basic Setup (5 minutes)
The app works immediately after installation! No configuration needed.

### Optional: Enable AI Features

**For AI Presentation Generation:**
1. Open the app
2. Go to **Settings** → **AI Services**
3. Click **"Download Ollama"** button
4. Wait for download (~3 GB)
5. AI features now enabled!

**For AI Image Generation:**
1. Go to **Settings** → **AI Services**
2. Click **"Setup Stable Diffusion"** (optional)
3. This downloads ~7 GB of models
4. Takes 10-15 minutes

**You can skip AI setup and use the app right away!**

---

## Updating

### Automatic Updates (Recommended)
- The app checks for updates on launch
- Click **"Update"** when prompted
- Updates install automatically

### Manual Updates
1. Download the latest `.exe` from Releases
2. Run it - it will update your existing installation
3. Your presentations are preserved

---

## Uninstalling

### Method 1: Windows Settings
1. Open **Settings** → **Apps**
2. Find **"Slides Clone"**
3. Click **Uninstall**

### Method 2: Control Panel
1. Open **Control Panel** → **Programs and Features**
2. Find **"Slides Clone"**
3. Click **Uninstall**

**Your presentations are saved in:** `%APPDATA%\Slides Clone\data`
- These are NOT deleted when you uninstall
- You can back them up or delete them manually

---

## Troubleshooting

### "Windows protected your PC" message
This is normal for new apps. Click **"More info"** → **"Run anyway"**

### App won't start
1. Make sure Windows 10/11 is up to date
2. Try running as administrator (right-click → Run as administrator)
3. Check antivirus isn't blocking it

### AI features not working
1. Make sure you have internet for initial model download
2. Check you have enough disk space (10+ GB)
3. Some AI features require a GPU

### Need more help?
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions

---

## Data Location

All your presentations and settings are stored in:
```
C:\Users\YourUsername\AppData\Roaming\Slides Clone\
├── data\               # Your presentations
├── cache\              # Cached AI responses
└── settings.json       # App settings
```

**To backup your work:** Copy the `data` folder

---

## Building from Source (Advanced)

Only for developers who want to customize the app:

```bash
# 1. Install dependencies
npm install

# 2. Build Windows installer
npm run build:win

# 3. Find installer in: packages/electron/build/
```

See [README.md](./README.md) for full development setup.
