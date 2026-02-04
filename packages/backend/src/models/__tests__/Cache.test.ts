import { CacheModel } from '../Cache';
import { db, initializeDatabase } from '../../utils/database';

describe('CacheModel', () => {
  beforeAll(() => {
    process.env.DB_PATH = ':memory:';
    initializeDatabase();
  });

  afterEach(() => {
    db.prepare('DELETE FROM cache').run();
  });

  describe('set', () => {
    it('should set cache entry', () => {
      const entry = CacheModel.set('test-key', 'test-value', 'ai');

      expect(entry).toBeDefined();
      expect(entry.key).toBe('test-key');
      expect(entry.value).toBe('test-value');
      expect(entry.type).toBe('ai');
    });

    it('should set cache entry with expiration', () => {
      const entry = CacheModel.set('expire-key', 'expire-value', 'ai', 60000);

      expect(entry.expiresAt).toBeDefined();
    });

    it('should replace existing key', () => {
      CacheModel.set('replace-key', 'value1', 'ai');
      const entry = CacheModel.set('replace-key', 'value2', 'ai');

      expect(entry.value).toBe('value2');

      const retrieved = CacheModel.get('replace-key');
      expect(retrieved?.value).toBe('value2');
    });
  });

  describe('get', () => {
    it('should get cache entry', () => {
      CacheModel.set('get-key', 'get-value', 'ai');
      const entry = CacheModel.get('get-key');

      expect(entry).toBeDefined();
      expect(entry?.value).toBe('get-value');
    });

    it('should return null for non-existent key', () => {
      const entry = CacheModel.get('non-existent');
      expect(entry).toBeNull();
    });

    it('should return null for expired entry', () => {
      CacheModel.set('expired-key', 'expired-value', 'ai', 1);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const entry = CacheModel.get('expired-key');
          expect(entry).toBeNull();
          resolve();
        }, 10);
      });
    });
  });

  describe('delete', () => {
    it('should delete cache entry', () => {
      CacheModel.set('delete-key', 'delete-value', 'ai');
      const deleted = CacheModel.delete('delete-key');

      expect(deleted).toBe(true);
      expect(CacheModel.get('delete-key')).toBeNull();
    });

    it('should return false for non-existent key', () => {
      const deleted = CacheModel.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('clearExpired', () => {
    it('should clear expired entries', () => {
      CacheModel.set('expired-1', 'value', 'ai', 1);
      CacheModel.set('expired-2', 'value', 'ai', 1);
      CacheModel.set('valid', 'value', 'ai', 60000);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const count = CacheModel.clearExpired();
          expect(count).toBe(2);
          expect(CacheModel.get('valid')).toBeDefined();
          resolve();
        }, 10);
      });
    });
  });

  describe('clearByType', () => {
    it('should clear entries by type', () => {
      CacheModel.set('ai-1', 'value', 'ai');
      CacheModel.set('ai-2', 'value', 'ai');
      CacheModel.set('img-1', 'value', 'image');

      const count = CacheModel.clearByType('ai');
      expect(count).toBe(2);
      expect(CacheModel.get('img-1')).toBeDefined();
    });
  });

  describe('clearAll', () => {
    it('should clear all entries', () => {
      CacheModel.set('key-1', 'value', 'ai');
      CacheModel.set('key-2', 'value', 'image');
      CacheModel.set('key-3', 'value', 'translation');

      const count = CacheModel.clearAll();
      expect(count).toBe(3);
      expect(CacheModel.get('key-1')).toBeNull();
    });
  });
});
