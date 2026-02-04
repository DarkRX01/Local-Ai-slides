# Troubleshooting Guide

Solutions to common issues and problems with the Presentation App.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Service Connection Problems](#service-connection-problems)
- [Performance Issues](#performance-issues)
- [Export Problems](#export-problems)
- [AI Features Not Working](#ai-features-not-working)
- [Image Generation Issues](#image-generation-issues)
- [Translation Problems](#translation-problems)
- [Database Errors](#database-errors)
- [Network and Connectivity](#network-and-connectivity)
- [Browser Compatibility](#browser-compatibility)
- [Platform-Specific Issues](#platform-specific-issues)
- [Error Messages Reference](#error-messages-reference)

---

## Installation Issues

### Issue: `better-sqlite3` Build Failure on Windows

**Error Message**:
```
gyp ERR! find VS could not find a version of Visual Studio 2017 or newer to use
```

**Cause**: Missing C++ build tools required for native modules.

**Solution**:

1. **Install Visual Studio Build Tools**:
   - Download from: https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++"
   - Ensure "MSVC v143 - VS 2022 C++ x64/x86 build tools" is checked
   - Install (requires ~7GB disk space)

2. **Alternative - Windows Build Tools**:
   ```bash
   npm install --global windows-build-tools
   ```

3. **Verify Installation**:
   ```bash
   npm install
   ```

4. **If still failing**, try:
   ```bash
   npm install --build-from-source
   ```

### Issue: Disk Space Error During Installation

**Error Message**:
```
npm warn tar TAR_ENTRY_ERROR ENOSPC: no space left on device
```

**Solution**:

1. **Check disk space**:
   ```bash
   # Windows
   wmic logicaldisk get size,freespace,caption
   
   # Linux/Mac
   df -h
   ```

2. **Free up space**:
   - Delete temporary files
   - Clear npm cache: `npm cache clean --force`
   - Remove old `node_modules`: `npx npkill`

3. **Minimum requirements**:
   - 5GB free for dependencies
   - 10GB for AI models (optional)
   - 20GB+ recommended total

### Issue: Permission Denied Errors

**Error Message**:
```
EACCES: permission denied
```

**Solution**:

**Windows**:
```bash
# Run as Administrator
# Right-click CMD → "Run as Administrator"
npm install
```

**Linux/Mac**:
```bash
# Don't use sudo with npm, fix permissions instead
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
npm install
```

### Issue: Node Version Incompatibility

**Error Message**:
```
The engine "node" is incompatible with this module
```

**Solution**:

1. **Check Node version**:
   ```bash
   node --version
   ```

2. **Required**: Node.js 18.0.0 or higher

3. **Upgrade Node**:
   - Download from: https://nodejs.org/
   - Or use nvm:
     ```bash
     nvm install 18
     nvm use 18
     ```

4. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## Service Connection Problems

### Issue: Cannot Connect to Ollama

**Symptoms**:
- AI features not working
- "Ollama service unavailable" error

**Solution**:

1. **Verify Ollama is installed**:
   ```bash
   ollama --version
   ```
   
   If not installed, run:
   ```bash
   npm run setup:ollama
   ```

2. **Start Ollama service**:
   ```bash
   ollama serve
   ```

3. **Verify connection**:
   ```bash
   curl http://localhost:11434/api/tags
   ```

4. **Check if port is blocked**:
   ```bash
   # Windows
   netstat -ano | findstr :11434
   
   # Linux/Mac
   lsof -i :11434
   ```

5. **If using firewall**, allow port 11434

6. **Environment variable** (if running on different host):
   ```bash
   # In packages/backend/.env
   OLLAMA_URL=http://your-ollama-host:11434
   ```

### Issue: LibreTranslate Container Not Running

**Symptoms**:
- Translation features fail
- "Translation service unavailable"

**Solution**:

1. **Check Docker is running**:
   ```bash
   docker ps
   ```

2. **If Docker not running**, start it:
   - Windows: Start Docker Desktop
   - Linux: `sudo systemctl start docker`
   - Mac: Start Docker Desktop

3. **Check container status**:
   ```bash
   docker ps -a | grep libretranslate
   ```

4. **Restart container**:
   ```bash
   docker restart libretranslate
   ```

5. **If container missing**, reinstall:
   ```bash
   docker rm -f libretranslate
   npm run setup:translate
   ```

6. **Check logs for errors**:
   ```bash
   docker logs libretranslate
   ```

7. **Verify connection**:
   ```bash
   curl http://localhost:5000/languages
   ```

### Issue: Stable Diffusion Not Responding

**Symptoms**:
- Image generation fails
- Timeout errors

**Solution**:

1. **Check if SD WebUI is running**:
   ```bash
   curl http://localhost:7860
   ```

2. **Start SD WebUI**:
   ```bash
   cd path/to/stable-diffusion-webui
   ./webui.sh --api
   # Windows: webui.bat --api
   ```

3. **Verify API is enabled**:
   - SD must be started with `--api` flag

4. **Check GPU availability**:
   ```bash
   # NVIDIA GPU
   nvidia-smi
   ```

5. **If no GPU**, CPU mode (slow):
   ```bash
   ./webui.sh --api --skip-torch-cuda-test
   ```

6. **Increase timeout** in `packages/backend/.env`:
   ```
   SD_TIMEOUT=120000
   ```

### Issue: Port Already in Use

**Error Message**:
```
EADDRINUSE: address already in use :::3001
```

**Solution**:

1. **Find process using port**:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -i :3001
   kill -9 <PID>
   ```

2. **Use different port**:
   ```bash
   # In packages/backend/.env
   PORT=3002
   
   # Update frontend API URL in packages/frontend/.env
   VITE_API_URL=http://localhost:3002
   ```

3. **Restart services**:
   ```bash
   npm run dev
   ```

---

## Performance Issues

### Issue: Slow Slide Rendering

**Symptoms**:
- Lag when editing slides
- Choppy animations

**Solution**:

1. **Reduce element count**:
   - Combine similar elements
   - Use vector shapes instead of images when possible

2. **Optimize images**:
   ```bash
   # Compress large images
   POST /api/images/compress
   ```

3. **Disable animations during editing**:
   - Settings → "Disable animations in edit mode"

4. **Clear browser cache**:
   ```bash
   # In DevTools
   Ctrl+Shift+Delete → Clear cache
   ```

5. **Use Chrome or Edge**:
   - Best performance with Chromium-based browsers

6. **Hardware acceleration**:
   - Ensure GPU acceleration enabled in browser
   - chrome://settings → Advanced → Use hardware acceleration

### Issue: High Memory Usage

**Symptoms**:
- Browser tab crashes
- System slowdown

**Solution**:

1. **Limit slide count**:
   - Split large presentations into multiple files

2. **Clear cache**:
   ```bash
   # Backend cache
   DELETE /api/translation/cache
   ```

3. **Close unused presentations**:
   - Don't keep multiple presentations open

4. **Restart app periodically**

5. **Increase Node.js memory** (if backend crashes):
   ```json
   {
     "scripts": {
       "dev:backend": "NODE_OPTIONS='--max-old-space-size=4096' ..."
     }
   }
   ```

### Issue: Slow AI Generation

**Symptoms**:
- Long wait times for AI responses
- Timeouts

**Solution**:

1. **Use smaller model**:
   ```bash
   # Use Llama 3.2 (3B) instead of Llama 3 (7B)
   ollama pull llama3.2
   ```

2. **Reduce temperature**:
   - Lower temperature = faster generation
   - Settings → AI → Temperature: 0.3

3. **Check CPU/GPU usage**:
   - Ensure Ollama has resources available
   - Close other applications

4. **Increase timeout**:
   ```env
   AI_TIMEOUT=180000
   ```

5. **Use response caching**:
   - Enabled by default
   - Similar prompts return instantly from cache

---

## Export Problems

### Issue: PDF Export Fails

**Error**: "Failed to generate PDF"

**Solution**:

1. **Check disk space**:
   - Ensure sufficient space in `data/exports/`

2. **Verify Puppeteer**:
   ```bash
   # Reinstall Puppeteer
   cd packages/backend
   npm install puppeteer
   ```

3. **Increase timeout**:
   ```env
   EXPORT_TIMEOUT=300000
   ```

4. **Check fonts**:
   - Ensure system fonts are available
   - Or use web fonts only

5. **Try lower quality**:
   - Use "draft" quality for testing

6. **Check logs**:
   ```bash
   cat data/exports/logs/latest.log
   ```

### Issue: Video Export Fails

**Error**: "FFmpeg not found"

**Solution**:

1. **Install FFmpeg**:
   ```bash
   # Windows (with Chocolatey)
   choco install ffmpeg
   
   # Mac
   brew install ffmpeg
   
   # Linux
   sudo apt install ffmpeg
   ```

2. **Verify installation**:
   ```bash
   ffmpeg -version
   ```

3. **Add to PATH** (Windows):
   - Download from: https://ffmpeg.org/download.html
   - Extract to `C:\ffmpeg`
   - Add `C:\ffmpeg\bin` to PATH

4. **Specify path** in `.env`:
   ```env
   FFMPEG_PATH=/path/to/ffmpeg
   ```

5. **Use lower quality/FPS**:
   - 720p instead of 1080p
   - 24fps instead of 60fps

### Issue: PPTX Export Missing Elements

**Solution**:

1. **Check element types**:
   - Custom elements may not be supported
   - Use basic shapes and text

2. **Simplify animations**:
   - Complex animations simplified in PPTX

3. **Test in PowerPoint**:
   - Some features require PowerPoint 2016+

4. **Report unsupported features** on GitHub

---

## AI Features Not Working

### Issue: AI Generation Returns Empty Results

**Solution**:

1. **Check model is downloaded**:
   ```bash
   ollama list
   ```

2. **Download model**:
   ```bash
   ollama pull llama3
   ```

3. **Test Ollama directly**:
   ```bash
   ollama run llama3 "Hello"
   ```

4. **Check backend logs**:
   ```bash
   # In packages/backend
   npm run dev
   # Watch console for errors
   ```

5. **Increase max tokens**:
   ```env
   AI_MAX_TOKENS=2048
   ```

### Issue: AI Suggestions Not Relevant

**Solution**:

1. **Improve prompts**:
   - Be more specific
   - Add context and requirements
   - Specify audience and tone

2. **Try different model**:
   ```bash
   ollama pull mistral
   ```
   
   Then in UI: Settings → AI → Model: Mistral

3. **Adjust temperature**:
   - Lower (0.3-0.5) for focused results
   - Higher (0.7-1.0) for creative results

4. **Regenerate**:
   - Click "Regenerate" for different output

### Issue: Streaming Response Stops Midway

**Solution**:

1. **Check network connection**

2. **Increase timeout**:
   ```env
   AI_STREAM_TIMEOUT=180000
   ```

3. **Check Ollama logs**:
   ```bash
   ollama logs
   ```

4. **Reduce prompt length**:
   - Very long prompts can cause issues

---

## Image Generation Issues

### Issue: Stable Diffusion Generation Fails

**Error**: "Image generation failed"

**Solution**:

1. **Check SD WebUI is running**:
   ```bash
   curl http://localhost:7860/sdapi/v1/sd-models
   ```

2. **Check model loaded**:
   - SD WebUI must have a model selected

3. **Reduce image size**:
   - Try 512x512 instead of 1024x1024

4. **Check GPU memory**:
   - Large images require more VRAM
   - Close other GPU applications

5. **Use CPU mode** (if no GPU):
   ```bash
   # Slower but works
   ./webui.sh --api --skip-torch-cuda-test --use-cpu all
   ```

### Issue: Image Search Returns No Results

**Solution**:

1. **Google API** method:
   - Verify API key in `.env`:
     ```env
     GOOGLE_API_KEY=your-key
     GOOGLE_SEARCH_ENGINE_ID=your-id
     ```
   - Check API quota not exceeded

2. **Scraping** method (fallback):
   - Ensure Puppeteer installed
   - Check internet connection
   - Some sites may block scraping

3. **Try different search terms**

### Issue: Background Removal Not Working

**Error**: "Failed to remove background"

**Solution**:

1. **Check image format**:
   - Works best with JPG, PNG
   - May fail with complex backgrounds

2. **Try different image**:
   - Clear backgrounds work better

3. **Manual editing**:
   - Use external tool like remove.bg
   - Upload processed image

---

## Translation Problems

### Issue: Translations Incorrect

**Solution**:

1. **Check source language**:
   - Auto-detect may be wrong
   - Manually specify source language

2. **Try different target language**:
   - Some language pairs work better

3. **Use professional translation**:
   - LibreTranslate is good but not perfect
   - Review and edit translations

4. **Clear cache and retry**:
   ```bash
   DELETE /api/translation/cache
   ```

### Issue: RTL Languages Display Incorrectly

**Solution**:

1. **Check browser supports RTL**

2. **Verify CSS direction**:
   - Should auto-detect for Arabic/Hebrew
   - Force direction in element properties

3. **Use RTL-compatible fonts**:
   - Some fonts don't support RTL

---

## Database Errors

### Issue: Database Locked

**Error**: "database is locked"

**Solution**:

1. **Close other instances**:
   - Only one app instance can write at a time

2. **Restart app**

3. **Check file permissions**:
   ```bash
   ls -l data/app.db
   chmod 664 data/app.db
   ```

### Issue: Database Corrupted

**Error**: "database disk image is malformed"

**Solution**:

1. **Backup database**:
   ```bash
   cp data/app.db data/app.db.backup
   ```

2. **Repair database**:
   ```bash
   sqlite3 data/app.db "PRAGMA integrity_check;"
   sqlite3 data/app.db ".recover" | sqlite3 data/app_recovered.db
   mv data/app_recovered.db data/app.db
   ```

3. **Restore from backup** (if available)

4. **Reinitialize** (last resort - loses data):
   ```bash
   rm data/app.db
   npm run dev
   # Database recreated automatically
   ```

---

## Network and Connectivity

### Issue: CORS Errors in Browser

**Error**: "Access to fetch blocked by CORS policy"

**Solution**:

1. **Verify backend URL** in frontend `.env`:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

2. **Check CORS settings** in backend:
   ```typescript
   // packages/backend/src/server.ts
   app.use(cors({
     origin: 'http://localhost:3000'
   }));
   ```

3. **Clear browser cache**

4. **Disable browser extensions**:
   - Some ad blockers cause issues

### Issue: WebSocket Connection Fails

**Error**: "WebSocket connection failed"

**Solution**:

1. **Check backend is running**

2. **Verify WebSocket URL**:
   ```javascript
   ws://localhost:3001
   ```

3. **Check firewall**:
   - Allow WebSocket connections

4. **Try different browser**

5. **Check proxy settings**:
   - Some proxies block WebSockets

---

## Browser Compatibility

### Recommended Browsers

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ⚠️ Safari 14+ (limited support)
- ❌ Internet Explorer (not supported)

### Issue: Features Not Working in Safari

**Solution**:

1. **Update Safari** to latest version

2. **Enable experimental features**:
   - Safari → Develop → Experimental Features
   - Enable all relevant features

3. **Use Chrome or Edge** for full compatibility

### Issue: Animations Choppy in Firefox

**Solution**:

1. **Enable GPU acceleration**:
   - Firefox → Preferences → Performance
   - Uncheck "Use recommended performance settings"
   - Check "Use hardware acceleration"

2. **Reduce animation complexity**

3. **Use Chrome** for best performance

---

## Platform-Specific Issues

### Windows

**Issue: Path too long**

**Solution**:
```bash
# Enable long paths
git config --system core.longpaths true

# Or move project to shorter path like C:\projects\
```

**Issue: Scripts not executing**

**Solution**:
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

**Issue: Permission denied for `/usr/local`**

**Solution**:
```bash
sudo chown -R $(whoami) /usr/local
```

**Issue: Gatekeeper blocks Electron app**

**Solution**:
```bash
# Allow app to run
sudo xattr -r -d com.apple.quarantine path/to/app
```

### Linux

**Issue: Electron won't start**

**Solution**:
```bash
# Install dependencies
sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1 libxcb-dri3-0
```

**Issue: Docker permission denied**

**Solution**:
```bash
sudo usermod -aG docker $USER
# Logout and login again
```

---

## Error Messages Reference

### `ECONNREFUSED`

**Meaning**: Cannot connect to service

**Check**:
- Service is running
- Correct port number
- Firewall not blocking

### `ETIMEDOUT`

**Meaning**: Request took too long

**Solution**:
- Increase timeout values
- Check network connection
- Verify service is responding

### `ENOENT`

**Meaning**: File or directory not found

**Check**:
- File path is correct
- File exists
- Permissions correct

### `MODULE_NOT_FOUND`

**Meaning**: npm package missing

**Solution**:
```bash
npm install
```

### `ERR_INVALID_ARG_TYPE`

**Meaning**: Wrong data type passed to function

**Check**:
- API request format
- Type definitions
- Update TypeScript

---

## Getting Help

If you're still experiencing issues:

1. **Check logs**:
   ```bash
   # Backend logs
   cat data/logs/backend.log
   
   # Frontend console
   # Open DevTools → Console
   ```

2. **Search existing issues**:
   - GitHub Issues

3. **Create new issue** with:
   - Steps to reproduce
   - Expected vs actual behavior
   - System information:
     ```bash
     node --version
     npm --version
     # OS and version
     ```
   - Error messages and logs
   - Screenshots (if applicable)

4. **Community support**:
   - Discord server
   - Stack Overflow (tag: `presentation-app`)

---

## Diagnostic Commands

Run these to gather system information for bug reports:

```bash
# System info
node --version
npm --version
ollama --version
docker --version
ffmpeg -version

# Service status
curl http://localhost:3001/health
curl http://localhost:11434/api/tags
curl http://localhost:5000/languages
curl http://localhost:7860/

# Disk space
df -h

# Process list
ps aux | grep "node\|ollama\|docker"

# Network
netstat -tlnp

# Logs
tail -n 50 data/logs/backend.log
docker logs libretranslate --tail 50
```

---

**Need more help?** Open an issue on GitHub with detailed information about your problem.
