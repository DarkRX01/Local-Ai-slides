#!/usr/bin/env node

import { execSync } from 'child_process'
import { platform } from 'os'
import { existsSync } from 'fs'
import https from 'https'

const OLLAMA_DOWNLOAD_URLS = {
  win32: 'https://ollama.ai/download/windows',
  darwin: 'https://ollama.ai/download/mac',
  linux: 'https://ollama.ai/download/linux',
}

const DEFAULT_MODELS = ['llama3', 'mistral']

console.log('🦙 Ollama Setup\n')

function checkOllamaInstalled() {
  try {
    execSync('ollama --version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function checkOllamaRunning() {
  try {
    execSync('curl -s http://localhost:11434/api/tags', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

async function checkModelInstalled(model) {
  return new Promise((resolve) => {
    https.get('http://localhost:11434/api/tags', (res) => {
      let data = ''
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const installed = json.models?.some((m) => m.name.startsWith(model))
          resolve(installed)
        } catch {
          resolve(false)
        }
      })
    }).on('error', () => resolve(false))
  })
}

function installOllama() {
  const os = platform()
  const downloadUrl = OLLAMA_DOWNLOAD_URLS[os]

  if (!downloadUrl) {
    console.error(`❌ Unsupported platform: ${os}`)
    process.exit(1)
  }

  console.log(`📥 Please download and install Ollama from: ${downloadUrl}`)
  console.log('   Follow the installation instructions for your platform.')
  console.log('   After installation, restart this script.\n')
  process.exit(0)
}

function pullModel(model) {
  console.log(`📥 Pulling ${model} model (this may take several minutes)...`)
  try {
    execSync(`ollama pull ${model}`, { stdio: 'inherit' })
    console.log(`✅ ${model} model installed successfully`)
  } catch (error) {
    console.error(`❌ Failed to pull ${model} model`)
    throw error
  }
}

async function main() {
  if (!checkOllamaInstalled()) {
    console.log('⚠️  Ollama is not installed')
    installOllama()
    return
  }

  console.log('✅ Ollama is installed')

  if (!checkOllamaRunning()) {
    console.log('\n⚠️  Ollama service is not running')
    console.log('   Please start Ollama with: ollama serve')
    console.log('   Or start it from your system tray/menu\n')
    process.exit(1)
  }

  console.log('✅ Ollama service is running')

  console.log('\n📦 Checking models...')
  for (const model of DEFAULT_MODELS) {
    const installed = await checkModelInstalled(model)
    if (installed) {
      console.log(`✅ ${model} model already installed`)
    } else {
      console.log(`⚠️  ${model} model not found, installing...`)
      pullModel(model)
    }
  }

  console.log('\n✅ Ollama setup complete!')
  console.log('   Available models:', DEFAULT_MODELS.join(', '))
}

main().catch((error) => {
  console.error('❌ Setup failed:', error.message)
  process.exit(1)
})
