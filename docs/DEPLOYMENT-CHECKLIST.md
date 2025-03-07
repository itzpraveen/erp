# Railway Deployment Checklist

Use this checklist to ensure you've completed all necessary steps before deploying to Railway.

## Pre-Deployment

- [ ] Run the cleanup script: `./cleanup.sh`
- [ ] Remove all sensitive information from the codebase (API keys, passwords, etc.)
- [ ] Update environment variables in your Railway project (not in the code)
- [ ] Create a production MongoDB database (Railway MongoDB or Atlas)
- [ ] Update the backend connection string to use the production database
- [ ] Run the frontend in production mode locally to test: `cd frontend && npm run build`
- [ ] Test the production build locally with: `cd backend && NODE_ENV=production npm start`

## Repository Configuration

- [ ] Make sure .gitignore contains:
  - [ ] node_modules
  - [ ] .env files (except .env.example)
  - [ ] build directories
  - [ ] log files
  - [ ] IDE-specific files (.vscode, .idea)

## Application Configuration

- [ ] Set `NODE_ENV=production` for Railway
- [ ] Set a strong, unique `JWT_SECRET`
- [ ] Configure proper CORS settings
- [ ] Ensure all API endpoints are protected with authentication where needed
- [ ] Verify WebSocket connections work in production mode
- [ ] Check that static files are served correctly

## Database Configuration

- [ ] Create indexes for frequently queried fields
- [ ] Set up proper user authentication
- [ ] Configure automatic backups
- [ ] Test database connection with production connection string

## Performance Optimizations

- [ ] Ensure frontend bundle is optimized (code splitting implemented)
- [ ] Set proper cache headers for static assets
- [ ] Enable GZIP compression

## Security

- [ ] Enable Helmet middleware with proper settings
- [ ] Implement rate limiting for sensitive endpoints
- [ ] Use HTTP-only cookies for authentication
- [ ] Validate all user inputs
- [ ] Remove any test/debug routes in production
- [ ] Configure proper Content Security Policy

## Deployment

- [ ] Push clean code to GitHub repository
- [ ] Connect repository to Railway
- [ ] Set all required environment variables in Railway
- [ ] Deploy the application
- [ ] Verify the deployment works by accessing the application URL
- [ ] Check API endpoints are functioning
- [ ] Verify WebSocket connections
- [ ] Monitor logs for any errors

## Post-Deployment

- [ ] Set up monitoring
- [ ] Configure custom domain (if needed)
- [ ] Test authentication flows
- [ ] Verify database operations
- [ ] Check real-time features

## Notes

Add any project-specific notes or considerations here:

- WebSocket paths must match the server configuration
- Remember to update JWT_SECRET regularly
- Database backups should be scheduled weekly
