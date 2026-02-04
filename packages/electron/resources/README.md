# Electron Resources

This directory contains platform-specific resources for the Electron application.

## Icons

You need to provide the following icon files for building the application:

### Windows
- **icon.ico** - 256x256px (or multiple sizes embedded)
  - Used for the Windows executable and taskbar

### macOS
- **icon.icns** - Contains multiple resolutions (16x16 to 1024x1024)
  - Used for the macOS app bundle and Dock

### Linux
- **icon.png** - 512x512px or 1024x1024px
  - Used for Linux desktop integration

## Creating Icons

### From a PNG source (recommended: 1024x1024px)

#### Windows (.ico)
Use tools like:
- ImageMagick: `convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
- Online converters: https://convertio.co/png-ico/
- electron-icon-maker: `npm install -g electron-icon-maker && electron-icon-maker --input=icon.png --output=./`

#### macOS (.icns)
Use tools like:
- iconutil (macOS built-in): Create an iconset folder and use `iconutil -c icns iconset`
- png2icns: `npm install -g png2icns && png2icns icon.png icon.icns`
- electron-icon-maker (see above)

#### Linux (.png)
Simply use a high-resolution PNG (512x512 or 1024x1024)

## Placeholder Icons

Currently, placeholder files should be created. The build process will use default Electron icons if these files are missing, but for production builds, proper branded icons should be provided.

To generate icons from a source image:
```bash
npm install -g electron-icon-maker
electron-icon-maker --input=path/to/your/logo.png --output=packages/electron/resources
```
