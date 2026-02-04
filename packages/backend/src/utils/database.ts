import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'presentations.sqlite');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS presentations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      theme TEXT NOT NULL,
      settings TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS slides (
      id TEXT PRIMARY KEY,
      presentation_id TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      elements TEXT NOT NULL,
      animations TEXT NOT NULL,
      background TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cache (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      password_protection INTEGER NOT NULL DEFAULT 0,
      password TEXT,
      theme TEXT NOT NULL DEFAULT 'auto',
      language TEXT NOT NULL DEFAULT 'en',
      auto_save INTEGER NOT NULL DEFAULT 1,
      auto_save_interval INTEGER NOT NULL DEFAULT 30000,
      export_quality TEXT NOT NULL DEFAULT 'standard',
      ai_model TEXT NOT NULL DEFAULT 'llama3',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_url TEXT,
      source TEXT NOT NULL,
      width INTEGER,
      height INTEGER,
      size INTEGER,
      format TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS image_cache (
      id TEXT PRIMARY KEY,
      query TEXT NOT NULL,
      source TEXT NOT NULL,
      results TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS translation_cache (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      source_language TEXT NOT NULL,
      target_language TEXT NOT NULL,
      translated_text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS slide_voiceovers (
      id TEXT PRIMARY KEY,
      slide_id TEXT NOT NULL,
      audio_path TEXT NOT NULL,
      duration INTEGER NOT NULL,
      language TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (slide_id) REFERENCES slides(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_slides_presentation_id ON slides(presentation_id);
    CREATE INDEX IF NOT EXISTS idx_slides_order ON slides(presentation_id, order_index);
    CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
    CREATE INDEX IF NOT EXISTS idx_cache_type ON cache(type);
    CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename);
    CREATE INDEX IF NOT EXISTS idx_images_source ON images(source);
    CREATE INDEX IF NOT EXISTS idx_image_cache_query ON image_cache(query);
    CREATE INDEX IF NOT EXISTS idx_image_cache_source ON image_cache(source);
    CREATE INDEX IF NOT EXISTS idx_image_cache_expires ON image_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_translation_cache_text ON translation_cache(text);
    CREATE INDEX IF NOT EXISTS idx_translation_cache_languages ON translation_cache(source_language, target_language);
    CREATE INDEX IF NOT EXISTS idx_translation_cache_expires ON translation_cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_slide_voiceovers_slide_id ON slide_voiceovers(slide_id);
  `);

  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (settingsCount.count === 0) {
    db.prepare(`
      INSERT INTO settings (id, password_protection, theme, language, auto_save, auto_save_interval, export_quality, ai_model, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('default', 0, 'auto', 'en', 1, 30000, 'standard', 'llama3', new Date().toISOString(), new Date().toISOString());
  }
}

export function closeDatabase() {
  db.close();
}
