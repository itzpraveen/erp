# Tenaga Solar Solutions Theme Update

This document outlines the UI/UX theme update for the ERP system based on the Tenaga Solar Solutions design.

## Changes Made

1. **New Theme CSS**
   - Created a new theme file at `frontend/src/assets/styles/tenaga-theme.css`
   - Implemented color scheme from the Tenaga design (dark green primary color, red accent color, light pink background)
   - Updated typography, spacing, and component styling

2. **Updated Components**
   - **Header**: Updated to match the navigation in the Tenaga design
   - **Footer**: Redesigned with the Tenaga branding and layout
   - **HomePage**: Completely revamped to match the "Energizing the World with Solar Solutions" layout
   
3. **Color Scheme**
   - Primary: #183e34 (dark green)
   - Secondary: #c02c2c (dark red)
   - Background: #fcf0ef (light pink)
   - Text: #183e34 (dark green)
   - Light text: #585858 (gray)

4. **Application Structure**
   - Maintained all existing routes and functionality
   - Updated the layout of the home page to focus on solar solutions
   - Added sections for PM Surya Ghar Yojana scheme

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

## Future Enhancements

1. Add more solar-specific imagery and icons
2. Create service-specific pages with detailed information
3. Implement dark mode option
4. Add animations for smoother transitions
5. Optimize for mobile devices

## Credits

Design based on Tenaga Solar Solutions website.
