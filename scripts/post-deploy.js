#!/usr/bin/env node

/**
 * Post-deployment script for ModelViz
 * Runs after successful deployment to verify everything is working
 */

const https = require('https');
const { execSync } = require('child_process');

console.log('🔍 Running post-deployment verification...\n');

const deploymentUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL;

if (!deploymentUrl) {
  console.warn('⚠️  No deployment URL found. Skipping verification.');
  process.exit(0);
}

// Health check function
const checkEndpoint = (url, expectedStatus = 200) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === expectedStatus) {
        resolve(true);
      } else {
        reject(new Error(`Expected ${expectedStatus}, got ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

// Endpoints to check
const endpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/playground', name: 'Playground' },
  { path: '/models', name: 'Models' },
  { path: '/analytics', name: 'Analytics' },
  { path: '/api/health', name: 'API Health', expectedStatus: 200 }
];

// Run checks
console.log(`🌐 Checking deployment at: ${deploymentUrl}\n`);

Promise.all(
  endpoints.map(async ({ path, name, expectedStatus }) => {
    const url = `https://${deploymentUrl}${path}`;
    try {
      await checkEndpoint(url, expectedStatus);
      console.log(`✅ ${name}: OK`);
      return { name, status: 'OK' };
    } catch (error) {
      console.error(`❌ ${name}: Failed - ${error.message}`);
      return { name, status: 'Failed', error: error.message };
    }
  })
).then(results => {
  const failures = results.filter(r => r.status === 'Failed');
  
  if (failures.length > 0) {
    console.error('\n❌ Some checks failed:');
    failures.forEach(f => console.error(`   - ${f.name}: ${f.error}`));
    process.exit(1);
  } else {
    console.log('\n✨ All checks passed!');
    console.log(`🎉 ModelViz is live at: https://${deploymentUrl}`);
    
    // Log performance metrics if available
    if (process.env.VERCEL_ANALYTICS_ID) {
      console.log('\n📊 Analytics enabled with ID:', process.env.VERCEL_ANALYTICS_ID);
    }
    
    // Deployment summary
    console.log('\n📋 Deployment Summary:');
    console.log(`   - URL: https://${deploymentUrl}`);
    console.log(`   - Region: ${process.env.VERCEL_REGION || 'auto'}`);
    console.log(`   - Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`   - Timestamp: ${new Date().toISOString()}`);
  }
});