const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting setup process...\n');

console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  process.exit(1);
}

console.log('📝 Creating database directory...');
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✅ Database directory created\n');
} else {
  console.log('✅ Database directory already exists\n');
}

console.log('🎉 Setup complete!');
console.log('\nYou can now run:');
console.log('  npm run dev          - Start both frontend and backend');
console.log('  npm run dev:frontend - Start only frontend');
console.log('  npm run dev:backend  - Start only backend');
