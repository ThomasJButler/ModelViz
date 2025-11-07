#!/usr/bin/env node

/**
 * Pre-deployment script for ModelViz
 * Runs checks and preparations before deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Running pre-deployment checks...\n');

// Check Node version
const nodeVersion = process.version;
const requiredVersion = 'v18.0.0';
if (nodeVersion < requiredVersion) {
  console.error(`❌ Node.js ${requiredVersion} or higher is required. Current: ${nodeVersion}`);
  process.exit(1);
}
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check for required environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['NEXT_PUBLIC_BASE_URL'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingVars.join(', ')}`);
    console.warn('   These should be configured in your Vercel dashboard.\n');
  }
}

// Run type checking
console.log('\n📝 Running TypeScript type check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed');
} catch (error) {
  console.error('❌ TypeScript errors found. Please fix before deploying.');
  process.exit(1);
}

// Run linting
console.log('\n🔍 Running ESLint...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  console.warn('⚠️  Linting warnings found. Consider fixing before deployment.');
}

// Check for large files
console.log('\n📦 Checking for large files...');
const checkDirectory = (dir, maxSize = 5 * 1024 * 1024) => { // 5MB
  const files = fs.readdirSync(dir);
  const largeFiles = [];
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      largeFiles.push(...checkDirectory(filePath, maxSize));
    } else if (stat.isFile() && stat.size > maxSize) {
      largeFiles.push({
        path: filePath,
        size: (stat.size / 1024 / 1024).toFixed(2) + 'MB'
      });
    }
  });
  
  return largeFiles;
};

const publicDir = path.join(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  const largeFiles = checkDirectory(publicDir);
  if (largeFiles.length > 0) {
    console.warn('⚠️  Large files detected in public directory:');
    largeFiles.forEach(file => {
      console.warn(`   - ${file.path}: ${file.size}`);
    });
    console.warn('   Consider optimizing these files for better performance.\n');
  } else {
    console.log('✅ No large files detected');
  }
}

// Build the project
console.log('\n🏗️  Building the project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed. Please fix errors before deploying.');
  process.exit(1);
}

// Create deployment info
const deploymentInfo = {
  timestamp: new Date().toISOString(),
  nodeVersion: process.version,
  npmVersion: execSync('npm --version').toString().trim(),
  nextVersion: require('../package.json').dependencies.next,
  commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
  branch: process.env.VERCEL_GIT_COMMIT_REF || 'main'
};

fs.writeFileSync(
  path.join(process.cwd(), '.next', 'deployment-info.json'),
  JSON.stringify(deploymentInfo, null, 2)
);

console.log('\n✨ Pre-deployment checks complete!');
console.log('📋 Deployment info:', deploymentInfo);
console.log('\n🚀 Ready for deployment to Vercel!\n');