# API Guidelines for ERP Frontend

## API Path Structure

To prevent issues with duplicate API prefixes, please follow these guidelines when making API calls:

### Correct Pattern

Our `api` utility (from `src/utils/api.js`) already includes the `/api` prefix in its base URL. Therefore, when making API calls, **do not include the `/api/` prefix** in your endpoint paths.

#### ✅ Correct Examples:
```javascript
// Correct - the baseURL in api.js already includes '/api'
api.get('/users');
api.post('/leads', data);
api.put(`/projects/${id}`, data);
```

#### ❌ Incorrect Examples:
```javascript
// Wrong - this will result in a request to /api/api/users
api.get('/api/users');

// Wrong - this will also result in a request to /api/api/leads
api.post('/api/leads', data);
```

## Using API Utilities

For more consistent API calls, consider using the helper functions in `apiUtils.js`:

```javascript
import { createApiPath, createServiceBaseUrl } from '../utils/apiUtils';

// Create a base URL for a service
const BASE_URL = createServiceBaseUrl('projects');

// Get all projects
const getProjects = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

// Get project by ID
const getProjectById = async (id) => {
  const url = createApiPath('projects', id);
  const response = await api.get(url);
  return response.data;
};

// Submit an action
const submitProject = async (id, data) => {
  const url = createApiPath('projects', id, 'submit');
  const response = await api.post(url, data);
  return response.data;
};
```

## Error Prevention

Our API client includes protection against duplicate prefixes and will automatically correct and log warnings if it detects `/api/api/` patterns. However, it's still better to follow the correct pattern from the start.

## Service Pattern

For new features, consider using the service pattern:

1. Create a service file with consistent API paths
2. Define a `BASE_URL` constant at the top of the file
3. Use utility functions to construct paths
4. Handle errors consistently

Example:
```javascript
import api from '../../utils/api';
import { createApiPath, createServiceBaseUrl } from '../../utils/apiUtils';

const BASE_URL = createServiceBaseUrl('feature-name');

// Error handling helper function
const handleError = (error) => {
  const message =
    error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
  return message;
};

// Service functions
const getItems = async (token, params = {}) => {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      params,
    };
    const response = await api.get(BASE_URL, config);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export default {
  getItems,
  // other functions...
};
```
