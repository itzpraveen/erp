# AI Collaboration Guide for ERP Project

This document provides guidelines for efficiently collaborating with AI assistants on this ERP project.

## Quick Start

1. **Generate a project summary**:
   ```bash
   ./scripts/project-summary.sh
   ```
   This creates a `project-summary.md` file you can share with AI assistants.

2. **Use the context templates** in your conversations to provide effective context.

## Key Files for Understanding the Project

### Configuration
- `/package.json` - Main project configuration
- `/backend/src/config/config.js` - Backend configuration
- `/railway.json` - Railway deployment settings

### Backend
- `/backend/src/server.js` - Main entry point
- `/backend/src/routes/` - API routes
- `/backend/src/models/` - Data models
- `/backend/src/controllers/` - Request handlers

### Frontend
- `/frontend/src/App.js` - Main component
- `/frontend/src/pages/` - Top-level UI pages
- `/frontend/src/components/` - Reusable components
- `/frontend/src/context/` - State management

### Deployment
- `/docker-compose.yml` - Local deployment
- `/railway.json` - Railway settings

## Common Tasks and Their File Paths

### Authentication
- `/backend/src/models/User.js`
- `/backend/src/routes/userRoutes.js`
- `/backend/src/controllers/userController.js`
- `/frontend/src/context/AuthContext.js`

### Customer Management
- `/backend/src/models/Customer.js`
- `/backend/src/routes/customerRoutes.js`
- `/backend/src/controllers/customerController.js`
- `/frontend/src/pages/customers/`

### Project Management
- `/backend/src/models/Project.js`
- `/backend/src/routes/projectRoutes.js`
- `/backend/src/controllers/projectController.js`
- `/frontend/src/pages/projects/`

## Sharing Code with AI

### When to Share Full Files
- Main entry points
- Configuration files
- Models/schemas
- Interface definitions

### When to Share Specific Functions
- When debugging specific logic
- When improving a specific feature
- When discussing a particular algorithm

## Context Templates

### New Feature Context
```
I'm implementing a new feature for [purpose]. 
The main components involved are:
1. [Component A] - [brief description]
2. [Component B] - [brief description]

I need help with [specific challenge].
```

### Bug Fix Context
```
I'm fixing a bug where [description].
The issue occurs in [file/component].
The relevant code is:

[code snippet]

The expected behavior is [description].
The actual behavior is [description].
```

### Architecture Question Context
```
I'm trying to understand the [subsystem] architecture.
The main files are:
1. [File A]
2. [File B]

My specific question is: [question]
```

## Tips for Efficient AI Collaboration

1. **Focus on interfaces first**, implementations second
2. **Share context hierarchically** - broad overview, then details
3. **Use file paths consistently** to maintain context
4. **Maintain a glossary** of project-specific terms
5. **Create miniguides** for complex subsystems
