import { normalizePath, createApiPath, createServiceBaseUrl } from '../apiUtils';

describe('API Utilities', () => {
  describe('normalizePath', () => {
    it('should handle paths with leading slashes', () => {
      expect(normalizePath('/users')).toBe('/users');
    });

    it('should handle paths without leading slashes', () => {
      expect(normalizePath('users')).toBe('/users');
    });

    it('should remove api prefix if present', () => {
      expect(normalizePath('/api/users')).toBe('/users');
      expect(normalizePath('api/users')).toBe('/users');
    });

    it('should preserve the rest of the path after removing api prefix', () => {
      expect(normalizePath('/api/users/123')).toBe('/users/123');
      expect(normalizePath('api/users/123/profile')).toBe('/users/123/profile');
    });
  });

  describe('createApiPath', () => {
    it('should create a basic path without id or action', () => {
      expect(createApiPath('users')).toBe('/users');
    });

    it('should create a path with id', () => {
      expect(createApiPath('users', '123')).toBe('/users/123');
    });

    it('should create a path with id and action', () => {
      expect(createApiPath('users', '123', 'profile')).toBe('/users/123/profile');
    });

    it('should handle paths with api prefix', () => {
      expect(createApiPath('/api/users', '123')).toBe('/users/123');
    });
  });

  describe('createServiceBaseUrl', () => {
    it('should create a proper base URL for a service', () => {
      expect(createServiceBaseUrl('users')).toBe('/users');
    });

    it('should handle entity names with leading slashes', () => {
      expect(createServiceBaseUrl('/users')).toBe('/users');
    });

    it('should remove api prefix if present', () => {
      expect(createServiceBaseUrl('api/users')).toBe('/users');
      expect(createServiceBaseUrl('/api/users')).toBe('/users');
    });
  });
});
