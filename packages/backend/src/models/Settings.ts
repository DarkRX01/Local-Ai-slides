import { db } from '../utils/database';
import type { AppSettings, UpdateSettingsDto } from '@presentation-app/shared';

export class SettingsModel {
  static get(): AppSettings | null {
    const stmt = db.prepare('SELECT * FROM settings WHERE id = ?');
    const row = stmt.get('default') as any;

    if (!row) return null;

    return {
      id: row.id,
      passwordProtection: Boolean(row.password_protection),
      password: row.password,
      theme: row.theme,
      language: row.language,
      autoSave: Boolean(row.auto_save),
      autoSaveInterval: row.auto_save_interval,
      exportQuality: row.export_quality,
      aiModel: row.ai_model,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static update(data: UpdateSettingsDto): AppSettings | null {
    const existing = this.get();
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.passwordProtection !== undefined) {
      updates.push('password_protection = ?');
      values.push(data.passwordProtection ? 1 : 0);
    }

    if (data.password !== undefined) {
      updates.push('password = ?');
      values.push(data.password);
    }

    if (data.theme !== undefined) {
      updates.push('theme = ?');
      values.push(data.theme);
    }

    if (data.language !== undefined) {
      updates.push('language = ?');
      values.push(data.language);
    }

    if (data.autoSave !== undefined) {
      updates.push('auto_save = ?');
      values.push(data.autoSave ? 1 : 0);
    }

    if (data.autoSaveInterval !== undefined) {
      updates.push('auto_save_interval = ?');
      values.push(data.autoSaveInterval);
    }

    if (data.exportQuality !== undefined) {
      updates.push('export_quality = ?');
      values.push(data.exportQuality);
    }

    if (data.aiModel !== undefined) {
      updates.push('ai_model = ?');
      values.push(data.aiModel);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push('default');

    const stmt = db.prepare(`
      UPDATE settings
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.get();
  }
}
