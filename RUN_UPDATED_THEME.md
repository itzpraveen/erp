# How to Run the Updated Tenaga Theme

Follow these steps to see the updated UI/UX for the Tenaga Solar Solutions theme:

## Quick Start

1. Navigate to the project directory:
   ```bash
   cd /Users/pravel/Music/erp
   ```

2. Start the application using Docker:
   ```bash
   docker-compose up -d
   ```

3. Access the application at [http://localhost:3001](http://localhost:3001)

## Manual Start

If you prefer not to use Docker:

1. Start the backend:
   ```bash
   cd /Users/pravel/Music/erp/backend
   npm install
   npm start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd /Users/pravel/Music/erp/frontend
   npm install
   npm start
   ```

3. Access the application at [http://localhost:3001](http://localhost:3001)

## Key UI Changes

1. **New Color Scheme**: 
   - Primary: Dark green (#183e34)
   - Secondary: Dark red (#c02c2c)
   - Background: Light pink (#fcf0ef)

2. **Updated Navigation**:
   - Home
   - Services
   - About Us
   - Projects
   - Blogs
   - Contacts
   - Get Started button

3. **New Homepage**:
   - Hero section with "Energizing the World with Solar Solutions"
   - Feature cards for different solar services
   - About section
   - PM Surya Ghar Scheme section
   - Call to action

4. **Footer**:
   - Updated with Tenaga branding
   - Organized in four columns with contact information
   - Social links
   - Service links

## Notes

- The login functionality remains the same
- All existing pages and routes are preserved
- The new theme is applied to the main layout components

For more details, please see the `README.tenaga-update.md` file.
