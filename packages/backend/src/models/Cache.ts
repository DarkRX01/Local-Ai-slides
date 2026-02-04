import { db } from '../utils/database';
import { nanoid } from 'nanoid';
import type { CacheEntry } from '@presentation-app/shared';

export class CacheModel {
  static set(key: string, value: string, type: CacheEntry['type'], expiresInMs?: number): CacheEntry {
    const id = nanoid();
    const now = new Date().toISOString();
    const expiresAt = expiresInMs ? new Date(Date.now() + expiresInMs).toISOString() : null;

    const deleteStmt = db.prepare('DELETE FROM cache WHERE key = ?');
    deleteStmt.run(key);

    const insertStmt = db.prepare(`
      INSERT INTO cache (id, key, value, type, created_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, key, value, type, now, expiresAt);

    return {
      id,
      key,
      value,
      type,
      createdAt: now,
      expiresAt: expiresAt || undefined
    };
  }

  static get(key: string): CacheEntry | null {
    const stmt = db.prepare('SELECT * FROM cache WHERE key = ?');
    const row = stmt.get(key) as any;

    if (!row) return null;

    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      this.delete(key);
      return null;
    }

    return {
      id: row.id,
      key: row.key,
      value: row.value,
      type: row.type,
      createdAt: row.created_at,
      expiresAt: row.expires_at
    };
  }

  static delete(key: string): boolean {
    const stmt = db.prepare('DELETE FROM cache WHERE key = ?');
    const result = stmt.run(key);
    return result.changes > 0;
  }

  static clearExpired(): number {
    const stmt = db.prepare('DELETE FROM cache WHERE expires_at IS NOT NULL AND expires_at < ?');
    const result = stmt.run(new Date().toISOString());
    return result.changes;
  }

  static clearByType(type: CacheEntry['type']): number {
    const stmt = db.prepare('DELETE FROM cache WHERE type = ?');
    const result = stmt.run(type);
    return result.changes;
  }

  static clearAll(): number {
    const stmt = db.prepare('DELETE FROM cache');
    const result = stmt.run();
    return result.changes;
  }
}
