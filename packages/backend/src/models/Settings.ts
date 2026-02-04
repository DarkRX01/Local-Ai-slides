import { db } from '../utils/database';

export interface Settings {
  id: string;
  passwordProtection: boolean;
  password?: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  exportQuality: 'low' | 'medium' | 'high';
  aiModel: string;
  createdAt: string;
  updatedAt: string;
}

export class SettingsModel {
  static get(): Settings {
    const row = db.prepare('SELECT * FROM settings WHERE id = ?').get('default') as any;
    
    if (!row) {
      const now = new Date().toISOString();
      const defaultSettings = {
        id: 'default',
        passwordProtection: false,
        theme: 'auto' as const,
        language: 'en',
        autoSave: true,
        autoSaveInterval: 30000,
        exportQuality: 'medium' as const,
        aiModel: 'llama3',
        createdAt: now,
        updatedAt: now,
      };

      db.prepare(`
        INSERT INTO settings (id, password_protection, theme, language, auto_save, auto_save_interval, export_quality, ai_model, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        defaultSettings.id,
        defaultSettings.passwordProtection ? 1 : 0,
        defaultSettings.theme,
        defaultSettings.language,
        defaultSettings.autoSave ? 1 : 0,
        defaultSettings.autoSaveInterval,
        defaultSettings.exportQuality,
        defaultSettings.aiModel,
        defaultSettings.createdAt,
        defaultSettings.updatedAt
      );

      return defaultSettings;
    }

    return {
      id: row.id,
      passwordProtection: row.password_protection === 1,
      password: row.password || undefined,
      theme: row.theme,
      language: row.language,
      autoSave: row.auto_save === 1,
      autoSaveInterval: row.auto_save_interval,
      exportQuality: row.export_quality,
      aiModel: row.ai_model,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static update(updates: Partial<Settings>): Settings {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.passwordProtection !== undefined) {
      fields.push('password_protection = ?');
      values.push(updates.passwordProtection ? 1 : 0);
    }
    if (updates.password !== undefined) {
      fields.push('password = ?');
      values.push(updates.password);
    }
    if (updates.theme !== undefined) {
      fields.push('theme = ?');
      values.push(updates.theme);
    }
    if (updates.language !== undefined) {
      fields.push('language = ?');
      values.push(updates.language);
    }
    if (updates.autoSave !== undefined) {
      fields.push('auto_save = ?');
      values.push(updates.autoSave ? 1 : 0);
    }
    if (updates.autoSaveInterval !== undefined) {
      fields.push('auto_save_interval = ?');
      values.push(updates.autoSaveInterval);
    }
    if (updates.exportQuality !== undefined) {
      fields.push('export_quality = ?');
      values.push(updates.exportQuality);
    }
    if (updates.aiModel !== undefined) {
      fields.push('ai_model = ?');
      values.push(updates.aiModel);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push('default');

    if (fields.length > 0) {
      db.prepare(`UPDATE settings SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    return this.get();
  }

  static verifyPassword(password: string): boolean {
    const settings = this.get();
    if (!settings.passwordProtection || !settings.password) return true;
    return settings.password === password;
  }
}
