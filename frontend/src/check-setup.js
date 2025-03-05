/*
 * This file checks your React setup for common issues
 * Run using: node src/check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('Checking React project setup...');

// Check package.json
const packageJson = require('../package.json');
console.log('\n--- Checking package.json ---');
console.log(`React version: ${packageJson.dependencies.react}`);
console.log(`React DOM version: ${packageJson.dependencies['react-dom']}`);
console.log(`React Router version: ${packageJson.dependencies['react-router-dom'] || 'Not installed'}`);
console.log(`Redux version: ${packageJson.dependencies.redux || 'Not installed'}`);
console.log(`React Redux version: ${packageJson.dependencies['react-redux'] || 'Not installed'}`);
console.log(`Redux Toolkit version: ${packageJson.dependencies['@reduxjs/toolkit'] || 'Not installed'}`);

// Check if major dependencies exist
const requiredDeps = [
  'react', 
  'react-dom', 
  'react-router-dom', 
  'react-redux',
  '@reduxjs/toolkit'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
if (missingDeps.length > 0) {
  console.error(`\n⚠️ MISSING DEPENDENCIES: ${missingDeps.join(', ')}`);
} else {
  console.log('\n✅ All major dependencies are installed');
}

// Check for Router configuration
console.log('\n--- Checking Router setup ---');
const appJsPath = path.join(__dirname, 'App.js');
const appJs = fs.readFileSync(appJsPath, 'utf8');

if (appJs.includes('BrowserRouter') || appJs.includes('Router')) {
  console.log('✅ App.js contains Router component');
} else {
  console.error('⚠️ No Router found in App.js');
}

// Check Redux setup
console.log('\n--- Checking Redux setup ---');
const storeExists = fs.existsSync(path.join(__dirname, 'app', 'store.js'));
if (storeExists) {
  console.log('✅ Redux store found');
} else {
  console.error('⚠️ Redux store not found');
}

// Check index.js
console.log('\n--- Checking index.js ---');
const indexJsPath = path.join(__dirname, 'index.js');
const indexJs = fs.readFileSync(indexJsPath, 'utf8');

if (indexJs.includes('<Provider')) {
  console.log('✅ index.js includes Redux Provider');
} else {
  console.error('⚠️ No Redux Provider found in index.js');
}

console.log('\nSetup check complete!');