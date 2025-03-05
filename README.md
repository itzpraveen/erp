# Solar ERP System

A comprehensive ERP system for solar panel companies, featuring lead management, proposal generation, project tracking, and service request handling.

## Features

- **Lead Management**: Track and manage potential customers
- **Proposal Generation**: Create and manage customer proposals with PDF export
- **Project Management**: Track installation projects from start to finish
- **Service Requests**: Handle customer service and maintenance requests
- **User Management**: Multi-role system with different permission levels
- **Real-time Notifications**: Get updates via WebSockets

## Quick Start

We've included two scripts that make it easy to manage the application:

```bash
# Make the scripts executable (first time only)
chmod +x setup.sh start.sh

# Quick start with the simple script
./start.sh

# OR use the more comprehensive management script:

# Setup development environment
./setup.sh dev

# Install missing packages if needed
./setup.sh install

# View application logs
./setup.sh logs

# Backup the database
./setup.sh backup

# Setup production environment
./setup.sh prod
```

You can also use npm scripts:

```bash
# Start the application
npm start

# Setup development environment
npm run dev

# Setup production environment
npm run prod

# Backup the database
npm run backup
```

## Development Setup

1. Clone the repository
2. Run `./setup.sh dev` to start the development environment
3. Backend will be available at http://localhost:5001
4. Frontend will be available at http://localhost:3002

## Production Deployment

1. Create a `.env.production` file based on `.env.production.example`
2. Run `./setup.sh prod` to start the production environment
3. For more details, see [DEPLOYMENT.md](DEPLOYMENT.md)

## Directory Structure

- `backend/`: Node.js Express API
- `frontend/`: React application
- `nginx/`: Nginx configuration for production
- `docker-compose.yml`: Development environment configuration
- `docker-compose.prod.yml`: Production environment configuration

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed: `./setup.sh install`
2. Check logs for errors: `./setup.sh logs`
3. Restart the application: `docker-compose restart`
4. For more detailed deployment troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# erp
