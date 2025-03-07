#!/bin/bash
# project-summary.sh - Generate a comprehensive project summary for AI assistants
# Usage: ./scripts/project-summary.sh [output_file]

# Default output file
OUTPUT="${1:-project-summary.md}"

echo "Generating comprehensive project summary to $OUTPUT..."

# Initialize the file
cat > "$OUTPUT" <<EOL
# Project Summary: $(basename "$(pwd)")

Generated on: $(date)

## Project Structure
\`\`\`
EOL

# Add high-level directory structure (2 levels deep)
find . -type d -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/build/*" -not -path "*/dist/*" -maxdepth 2 | sort >> "$OUTPUT"
echo -e "\`\`\`\n" >> "$OUTPUT"

# Add project configuration
echo "## Project Configuration" >> "$OUTPUT"
echo "### package.json" >> "$OUTPUT"
echo '```json' >> "$OUTPUT"
cat package.json | grep -A3 -B3 '"scripts\|"dependencies\|"devDependencies' >> "$OUTPUT"
echo '```' >> "$OUTPUT"

# Backend summary
if [ -d "./backend" ]; then
  echo -e "\n## Backend" >> "$OUTPUT"
  echo "### Routes" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  find ./backend -type f -name "*Routes.js" | sort >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  
  echo "### Models" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  find ./backend -type f -name "*.js" -path "*/models/*" | sort >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
fi

# Frontend summary
if [ -d "./frontend" ]; then
  echo -e "\n## Frontend" >> "$OUTPUT"
  echo "### Pages" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  find ./frontend -type f -path "*/pages/*" -not -path "*/node_modules/*" | sort >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  
  echo "### Components" >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
  find ./frontend -type d -path "*/components/*" -not -path "*/node_modules/*" | sort | head -10 >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
fi

# Environment variables (safely)
echo -e "\n## Environment Variables" >> "$OUTPUT"
echo "### Available Variables" >> "$OUTPUT"
echo '```' >> "$OUTPUT"
if [ -f ".env.example" ]; then
  cat .env.example | grep -v "SECRET\|PASSWORD\|KEY" >> "$OUTPUT"
fi
echo '```' >> "$OUTPUT"

# Deployment
echo -e "\n## Deployment Configuration" >> "$OUTPUT"
if [ -f "docker-compose.yml" ]; then
  echo "### Docker Compose Services" >> "$OUTPUT"
  echo '```yaml' >> "$OUTPUT"
  grep -A2 "services:" docker-compose.yml >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
fi

if [ -f "railway.json" ]; then
  echo "### Railway Configuration" >> "$OUTPUT"
  echo '```json' >> "$OUTPUT"
  cat railway.json >> "$OUTPUT"
  echo '```' >> "$OUTPUT"
fi

# Recent changes
echo -e "\n## Recent Changes (Last 5 Commits)" >> "$OUTPUT"
echo '```' >> "$OUTPUT"
git log -n 5 --pretty=format:"%h - %an, %ar : %s" >> "$OUTPUT"
echo -e "\n\`\`\`" >> "$OUTPUT"

echo "Project summary generated at $OUTPUT"
