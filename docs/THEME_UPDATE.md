# Tenaga ERP Theme Update

This document outlines the minimal UI/UX theme update applied to the ERP system based on the Tenaga brand design.

## Changes Made

1. **New Minimal Theme**
   - Applied the Tenaga color scheme (dark green primary, red accent, light pink background)
   - Updated typography, buttons, forms, and cards with clean, modern styling
   - Maintained the existing ERP functionality and structure

2. **Simplified Components**
   - **Header**: Updated colors and styling while maintaining the original navigation structure
   - **Footer**: Minimal footer with logo and copyright
   - **Homepage**: Clean, focused landing page with direct login access
   
3. **Color Scheme**
   - Primary: #183e34 (dark green)
   - Secondary: #c02c2c (dark red)
   - Background: #fcf0ef (light pink)
   - Text: #183e34 (dark green)

## How to Run the Application

### Using Docker (Recommended)

1. Make sure Docker and Docker Compose are installed on your system
2. Navigate to the project root directory
3. Run the development environment:
   ```
   docker-compose up -d
   ```
4. Access the application at http://localhost:3001

### Using Standard Method

1. Setup the backend:
   ```
   cd backend
   npm install
   npm start
   ```

2. Setup the frontend:
   ```
   cd frontend
   npm install
   npm start
   ```

3. Access the application at http://localhost:3001
