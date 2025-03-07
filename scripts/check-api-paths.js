#!/usr/bin/env node

/**
 * This script checks the codebase for potential API path issues
 * It helps identify duplicate /api/ prefixes in API calls that could lead to errors
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.join(__dirname, '..', 'frontend', 'src');

// Pattern to look for potential issues
const problematicPatterns = [
  /api\.get\(['"`]\/api\//g,
  /api\.post\(['"`]\/api\//g,
  /api\.put\(['"`]\/api\//g,
  /api\.delete\(['"`]\/api\//g,
  /api\.patch\(['"`]\/api\//g,
  /API_URL\s*=\s*['"`]\/api\//g,
  /const\s+[A-Z_]+_URL\s*=\s*['"`]\/api\//g,
];

function checkDirectory(dir) {
  let issues = [];
  let filesChecked = 0;

  // Get all JS/JSX/TS/TSX files in the directory
  const files = execSync(`find ${dir} -type f -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx"`)
    .toString()
    .split('\n')
    .filter(Boolean);

  filesChecked = files.length;

  // Check each file for problematic patterns
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    problematicPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            file: path.relative(process.cwd(), file),
            pattern: match.trim(),
            message: 'Potential duplicate API prefix detected'
          });
        });
      }
    });
  });

  return { issues, filesChecked };
}

function main() {
  console.log('Checking for API prefix issues...');
  
  const { issues, filesChecked } = checkDirectory(SRC_DIR);
  
  console.log(`\nChecked ${filesChecked} files.`);
  
  if (issues.length === 0) {
    console.log('\n✅ No API prefix issues found!');
    return;
  }
  
  console.log(`\n⚠️ Found ${issues.length} potential API prefix issues:`);
  
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. File: ${issue.file}`);
    console.log(`   Pattern: ${issue.pattern}`);
    console.log(`   Message: ${issue.message}`);
  });
  
  console.log('\nPlease check these files and fix any duplicate API prefixes.');
  console.log('Remember that the api utility already includes "/api" as its baseURL.');
}

main();
