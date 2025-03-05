#!/bin/bash

# Initialize Git repository
git init

# Add all files to the repository
git add .

# Create .gitignore file for common files to ignore
cat > .gitignore << EOL
# Node.js
node_modules/
npm-debug.log
yarn-error.log
yarn-debug.log
.npm

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.staging.local
# Keep .env.production as it seems part of your repo

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Build
dist/
build/
out/
EOL

# Initial commit
git commit -m "Initial commit"

echo "Git repository is ready. Now execute the following commands to push to GitHub:"
echo ""
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "2. Then run the following commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your GitHub username and REPOSITORY_NAME with your repository name"
