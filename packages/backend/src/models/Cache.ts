import { db } from '../utils/database';
import { v4 as uuidv4 } from 'uuid';

export interface CacheEntry {
  id: string;
  key: string;
  value: string;
  type: string;
  createdAt: string;
  expiresAt?: string;
}

export class CacheModel {
  static get(key: string, type: string): string | null {
    const now = new Date().toISOString();
    
    db.prepare('DELETE FROM cache WHERE expires_at IS NOT NULL AND expires_at < ?').run(now);
    
    const row = db.prepare('SELECT * FROM cache WHERE key = ? AND type = ?').get(key, type) as any;
    
    if (!row) return null;
    
    if (row.expires_at && row.expires_at < now) {
      db.prepare('DELETE FROM cache WHERE id = ?').run(row.id);
      return null;
    }
    
    return row.value;
  }

  static set(key: string, value: string, type: string, ttl?: number): void {
    const id = uuidv4();
    const now = new Date().toISOString();
    const expiresAt = ttl ? new Date(Date.now() + ttl).toISOString() : null;

    const existing = db.prepare('SELECT id FROM cache WHERE key = ? AND type = ?').get(key, type) as any;
    
    if (existing) {
      db.prepare('UPDATE cache SET value = ?, expires_at = ? WHERE id = ?').run(value, expiresAt, existing.id);
    } else {
      db.prepare(`
        INSERT INTO cache (id, key, value, type, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, key, value, type, now, expiresAt);
    }
  }

  static delete(key: string, type: string): boolean {
    const result = db.prepare('DELETE FROM cache WHERE key = ? AND type = ?').run(key, type);
    return result.changes > 0;
  }

  static clear(type?: string): void {
    if (type) {
      db.prepare('DELETE FROM cache WHERE type = ?').run(type);
    } else {
      db.prepare('DELETE FROM cache').run();
    }
  }

  static cleanExpired(): void {
    const now = new Date().toISOString();
    db.prepare('DELETE FROM cache WHERE expires_at IS NOT NULL AND expires_at < ?').run(now);
  }
}
