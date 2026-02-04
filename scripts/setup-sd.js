#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { platform } from 'os'
import { homedir } from 'os'
import { join } from 'path'

console.log('🎨 Stable Diffusion WebUI Setup (Optional)\n')

const SD_REPO = 'https://github.com/AUTOMATIC1111/stable-diffusion-webui.git'
const SD_DIR = join(homedir(), 'stable-diffusion-webui')

function checkGitInstalled() {
  try {
    execSync('git --version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function checkPythonInstalled() {
  try {
    execSync('python --version', { stdio: 'pipe' })
    return true
  } catch {
    try {
      execSync('python3 --version', { stdio: 'pipe' })
      return true
    } catch {
      return false
    }
  }
}

function cloneRepository() {
  console.log('📥 Cloning Stable Diffusion WebUI repository...')
  console.log(`   Target directory: ${SD_DIR}`)
  
  try {
    execSync(`git clone ${SD_REPO} "${SD_DIR}"`, { stdio: 'inherit' })
    console.log('✅ Repository cloned successfully')
  } catch (error) {
    console.error('❌ Failed to clone repository')
    throw error
  }
}

function main() {
  console.log('⚠️  This is an OPTIONAL component for image generation')
  console.log('   Stable Diffusion requires significant disk space (10+ GB)')
  console.log('   and a capable GPU for good performance.\n')

  if (!checkGitInstalled()) {
    console.error('❌ Git is not installed')
    console.log('   Please install Git first: https://git-scm.com/downloads')
    process.exit(1)
  }

  if (!checkPythonInstalled()) {
    console.error('❌ Python is not installed')
    console.log('   Please install Python 3.10+: https://www.python.org/downloads/')
    process.exit(1)
  }

  console.log('✅ Git and Python are installed')

  if (existsSync(SD_DIR)) {
    console.log(`✅ Stable Diffusion WebUI already exists at: ${SD_DIR}`)
    console.log('   To start it, navigate to that directory and run:')
    if (platform() === 'win32') {
      console.log('   webui.bat')
    } else {
      console.log('   ./webui.sh')
    }
  } else {
    cloneRepository()
    console.log('\n📝 To complete setup:')
    console.log(`   1. Navigate to: ${SD_DIR}`)
    if (platform() === 'win32') {
      console.log('   2. Run: webui.bat')
    } else {
      console.log('   2. Run: ./webui.sh')
    }
    console.log('   3. The first run will download models (this takes time)')
    console.log('   4. Once running, it will be available at: http://localhost:7860')
  }

  console.log('\n✅ Stable Diffusion setup complete!')
  console.log('   Note: You need to start the WebUI manually when needed')
}

main()
