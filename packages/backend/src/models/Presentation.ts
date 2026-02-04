import { db } from '../utils/database';
import { nanoid } from 'nanoid';
import type { Presentation, CreatePresentationDto, UpdatePresentationDto, Theme, PresentationSettings } from '@presentation-app/shared';

const DEFAULT_THEME: Theme = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#ffffff',
    text: '#1f2937'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  },
  mode: 'light'
};

const DEFAULT_SETTINGS: PresentationSettings = {
  slideSize: { width: 1920, height: 1080 },
  aspectRatio: '16:9',
  autoSave: true,
  autoSaveInterval: 30000
};

export class PresentationModel {
  static create(data: CreatePresentationDto): Presentation {
    const id = nanoid();
    const now = new Date().toISOString();
    const theme = { ...DEFAULT_THEME, ...data.theme };
    const settings = { ...DEFAULT_SETTINGS, ...data.settings };

    const stmt = db.prepare(`
      INSERT INTO presentations (id, title, description, theme, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.title,
      data.description || null,
      JSON.stringify(theme),
      JSON.stringify(settings),
      now,
      now
    );

    return {
      id,
      title: data.title,
      description: data.description,
      theme,
      slides: [],
      settings,
      createdAt: now,
      updatedAt: now
    };
  }

  static findById(id: string): Presentation | null {
    const stmt = db.prepare('SELECT * FROM presentations WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    const slidesStmt = db.prepare('SELECT * FROM slides WHERE presentation_id = ? ORDER BY order_index ASC');
    const slideRows = slidesStmt.all(id) as any[];

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      theme: JSON.parse(row.theme),
      slides: slideRows.map(slideRow => ({
        id: slideRow.id,
        presentationId: slideRow.presentation_id,
        order: slideRow.order_index,
        elements: JSON.parse(slideRow.elements),
        animations: JSON.parse(slideRow.animations),
        background: JSON.parse(slideRow.background),
        notes: slideRow.notes
      })),
      settings: JSON.parse(row.settings),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static findAll(): Presentation[] {
    const stmt = db.prepare('SELECT * FROM presentations ORDER BY updated_at DESC');
    const rows = stmt.all() as any[];

    return rows.map(row => {
      const slidesStmt = db.prepare('SELECT * FROM slides WHERE presentation_id = ? ORDER BY order_index ASC');
      const slideRows = slidesStmt.all(row.id) as any[];

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        theme: JSON.parse(row.theme),
        slides: slideRows.map(slideRow => ({
          id: slideRow.id,
          presentationId: slideRow.presentation_id,
          order: slideRow.order_index,
          elements: JSON.parse(slideRow.elements),
          animations: JSON.parse(slideRow.animations),
          background: JSON.parse(slideRow.background),
          notes: slideRow.notes
        })),
        settings: JSON.parse(row.settings),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });
  }

  static update(id: string, data: UpdatePresentationDto): Presentation | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (data.theme !== undefined) {
      updates.push('theme = ?');
      values.push(JSON.stringify({ ...existing.theme, ...data.theme }));
    }

    if (data.settings !== undefined) {
      updates.push('settings = ?');
      values.push(JSON.stringify({ ...existing.settings, ...data.settings }));
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id);

    const stmt = db.prepare(`
      UPDATE presentations
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM presentations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
