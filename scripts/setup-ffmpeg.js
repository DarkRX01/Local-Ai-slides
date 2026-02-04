#!/usr/bin/env node

import { execSync } from 'child_process'
import { platform } from 'os'

console.log('🎬 FFmpeg Setup\n')

const FFMPEG_DOWNLOAD_URLS = {
  win32: 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip',
  darwin: 'Install via Homebrew: brew install ffmpeg',
  linux: 'Install via package manager: sudo apt install ffmpeg (Ubuntu/Debian)',
}

function checkFFmpegInstalled() {
  try {
    const result = execSync('ffmpeg -version', { encoding: 'utf-8', stdio: 'pipe' })
    const match = result.match(/ffmpeg version ([\d.]+)/)
    return match ? match[1] : true
  } catch {
    return false
  }
}

function installInstructions() {
  const os = platform()
  const instructions = FFMPEG_DOWNLOAD_URLS[os]

  console.log('\n⚠️  FFmpeg is not installed\n')
  console.log('Installation instructions:')

  if (os === 'win32') {
    console.log('  Windows:')
    console.log('  1. Download from:', instructions)
    console.log('  2. Extract the archive')
    console.log('  3. Add the bin folder to your PATH environment variable')
    console.log('  4. Restart your terminal/command prompt')
  } else if (os === 'darwin') {
    console.log('  macOS:')
    console.log(' ', instructions)
  } else if (os === 'linux') {
    console.log('  Linux:')
    console.log(' ', instructions)
    console.log('  Or: sudo yum install ffmpeg (RedHat/CentOS)')
    console.log('  Or: sudo pacman -S ffmpeg (Arch)')
  }

  console.log('\n  Alternative: Download from https://ffmpeg.org/download.html')
  console.log('\n  After installation, run this script again to verify.\n')
}

function main() {
  const version = checkFFmpegInstalled()

  if (!version) {
    installInstructions()
    process.exit(1)
  }

  console.log('✅ FFmpeg is installed')
  console.log(`   Version: ${version}`)
  console.log('\n✅ FFmpeg setup complete!')
  console.log('   Video export functionality will be available')
}

main()
