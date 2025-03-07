# Project Summary: erp

Generated on: Fri Mar  7 15:58:00 IST 2025

## Project Structure
```
.
./.git
./backend
./backend/backend
./backend/node_modules
./backend/src
./docs
./frontend
./frontend/build
./frontend/node_modules
./frontend/public
./frontend/src
./mongo-backups
./nginx
./scripts
```

## Project Configuration
### package.json
```json
  "version": "1.0.0",
  "description": "Solar Panel Company ERP System",
  "main": "index.js",
  "scripts": {
    "start": "cd backend && npm start",
    "build": "cd frontend && npm install && npm run build && cd ../backend && npm install",
    "setup": "./setup.sh",
```

## Backend
### Routes
```
./backend/src/modules/solarCalculation/solarCalculationRoutes.js
./backend/src/routes/customerRoutes.js
./backend/src/routes/healthRoutes.js
./backend/src/routes/leadRoutes.js
./backend/src/routes/projectRoutes.js
./backend/src/routes/proposalRoutes.js
./backend/src/routes/serviceRequestRoutes.js
./backend/src/routes/solarCalculatorRoutes.js
./backend/src/routes/testRoutes.js
./backend/src/routes/userRoutes.js
```
### Models
```
./backend/src/models/Customer.js
./backend/src/models/Lead.js
./backend/src/models/Project.js
./backend/src/models/Proposal.js
./backend/src/models/ServiceRequest.js
./backend/src/models/SolarServiceOffering.js
./backend/src/models/User.js
```

## Frontend
### Pages
```
./frontend/src/pages/CustomerDetailsPage.js
./frontend/src/pages/CustomersPage.js
./frontend/src/pages/DashboardPage.js
./frontend/src/pages/HomePage.js
./frontend/src/pages/LeadDetailsPage.js
./frontend/src/pages/LeadsDirectPage.js
./frontend/src/pages/LeadsPage.js
./frontend/src/pages/LeadsTestPage.js
./frontend/src/pages/LoginPage.js
./frontend/src/pages/ProjectDetailsPage.js
./frontend/src/pages/ProjectsPage.js
./frontend/src/pages/ProposalApprovalPage.js
./frontend/src/pages/ProposalDetailsPage.js
./frontend/src/pages/ProposalDetailsPage.localStorage.js
./frontend/src/pages/ProposalsPage.js
./frontend/src/pages/ProposalsPage.localStorage.js
./frontend/src/pages/ServiceRequestDetailsPage.js
./frontend/src/pages/ServiceRequestsPage.js
./frontend/src/pages/SolarCalculatorPage.js
./frontend/src/pages/SolarServiceOfferingDetailsPage.js
./frontend/src/pages/SolarServiceOfferingsPage.js
./frontend/src/pages/UserManagementPage.js
./frontend/src/pages/UsersPage.js
```
### Components
```
./frontend/src/components/SolarCalculator
./frontend/src/components/admin
./frontend/src/components/common
```

## Environment Variables
### Available Variables
```
# Environment Variables - SAMPLE FILE
# Copy this file to .env for development or .env.production for production

# MongoDB Configuration
MONGO_USER=admin
MONGO_URI=mongodb://mongodb:27017/solar-erp
MONGO_AUTH_SOURCE=admin

# JWT Configuration
JWT_EXPIRY=30d  # 30 days token expiry

# Redis Configuration (for production)
REDIS_URI=redis://redis:6379

# Application Settings
NODE_ENV=development  # Change to 'production' for production environments
PORT=5001
API_URL=http://localhost:5001
CLIENT_URL=http://localhost:3002

# Logging Settings
LOG_LEVEL=info  # Options: error, warn, info, debug

# Security Settings
RATE_LIMIT_WINDOW=15  # Rate limit window in minutes
RATE_LIMIT_MAX=100    # Maximum requests per window
CORS_ORIGINS=http://localhost:3002,https://yourdomain.com

# Email Settings (for future implementation)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM=noreply@yourdomain.com

# Backup Settings
BACKUP_RETENTION_DAYS=7
```

## Deployment Configuration
### Docker Compose Services
```yaml
services:
  # MongoDB Service
  mongodb:
```
### Railway Configuration
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && cd frontend && npm install && npm run build && cd ../backend && npm install"
  },
  "deploy": {
    "startCommand": "node backend/src/server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Recent Changes (Last 5 Commits)
```
06eebee - itzpraveen, 4 minutes ago : Fix Railway deployment by integrating database seeding functionality
c85b37a - itzpraveen, 23 minutes ago : fix: add database seeding to deployment process to ensure demo users exist
1af98c1 - itzpraveen, 30 minutes ago : feat: Implement production-ready enhancements for Railway deployment including improved health checks, request tracing, rate limiting, and security headers
da698fd - itzpraveen, 3 hours ago : Fix invalid TOML syntax in railway.toml
0c69419 - itzpraveen, 3 hours ago : Fix Railway healthcheck issues and improve server initialization
```
