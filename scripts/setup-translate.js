#!/usr/bin/env node

import { execSync } from 'child_process'

console.log('🌐 LibreTranslate Setup\n')

function checkDockerInstalled() {
  try {
    execSync('docker --version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function checkDockerRunning() {
  try {
    execSync('docker ps', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function checkLibreTranslateRunning() {
  try {
    const result = execSync('docker ps --filter "name=libretranslate" --format "{{.Names}}"', {
      encoding: 'utf-8',
    })
    return result.includes('libretranslate')
  } catch {
    return false
  }
}

function startLibreTranslate() {
  console.log('🚀 Starting LibreTranslate container...')
  console.log('   This will download the image if not already present (~2GB)')
  
  try {
    execSync(
      'docker run -d --name libretranslate -p 5000:5000 libretranslate/libretranslate',
      { stdio: 'inherit' }
    )
    console.log('✅ LibreTranslate container started')
  } catch (error) {
    console.error('❌ Failed to start LibreTranslate container')
    throw error
  }
}

function main() {
  if (!checkDockerInstalled()) {
    console.log('⚠️  Docker is not installed')
    console.log('   LibreTranslate runs best with Docker.')
    console.log('   Please install Docker: https://docs.docker.com/get-docker/')
    console.log('\n   Alternative: Install LibreTranslate via pip:')
    console.log('   pip install libretranslate')
    console.log('   libretranslate --host 0.0.0.0 --port 5000\n')
    process.exit(1)
  }

  console.log('✅ Docker is installed')

  if (!checkDockerRunning()) {
    console.error('❌ Docker is not running')
    console.log('   Please start Docker Desktop or Docker daemon')
    process.exit(1)
  }

  console.log('✅ Docker is running')

  if (checkLibreTranslateRunning()) {
    console.log('✅ LibreTranslate container is already running')
  } else {
    startLibreTranslate()
  }

  console.log('\n✅ LibreTranslate setup complete!')
  console.log('   API available at: http://localhost:5000')
  console.log('   Web interface: http://localhost:5000')
  console.log('\n   To stop: docker stop libretranslate')
  console.log('   To start again: docker start libretranslate')
}

main()
