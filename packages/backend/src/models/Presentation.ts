import { db } from '../utils/database';
import type { Presentation } from '@slides-clone/shared';

export class PresentationModel {
  static getAll(): Presentation[] {
    const rows = db.prepare('SELECT * FROM presentations ORDER BY updated_at DESC').all();
    return rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      theme: JSON.parse(row.theme),
      settings: JSON.parse(row.settings),
      slides: [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  static getById(id: string): Presentation | null {
    const row = db.prepare('SELECT * FROM presentations WHERE id = ?').get(id) as any;
    if (!row) return null;

    const slides = db.prepare('SELECT * FROM slides WHERE presentation_id = ? ORDER BY order_index ASC').all(id);

    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      theme: JSON.parse(row.theme),
      settings: JSON.parse(row.settings),
      slides: slides.map((slide: any) => ({
        id: slide.id,
        presentationId: slide.presentation_id,
        order: slide.order_index,
        elements: JSON.parse(slide.elements),
        animations: JSON.parse(slide.animations),
        background: JSON.parse(slide.background),
        notes: slide.notes || undefined,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  static create(presentation: Omit<Presentation, 'createdAt' | 'updatedAt'>): Presentation {
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO presentations (id, title, description, theme, settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      presentation.id,
      presentation.title,
      presentation.description || null,
      JSON.stringify(presentation.theme),
      JSON.stringify(presentation.settings || {}),
      now,
      now
    );

    for (const slide of presentation.slides) {
      db.prepare(`
        INSERT INTO slides (id, presentation_id, order_index, elements, animations, background, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        slide.id,
        presentation.id,
        slide.order,
        JSON.stringify(slide.elements),
        JSON.stringify(slide.animations),
        JSON.stringify(slide.background),
        slide.notes || null
      );
    }

    return {
      ...presentation,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(id: string, updates: Partial<Presentation>): Presentation | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.theme !== undefined) {
      fields.push('theme = ?');
      values.push(JSON.stringify(updates.theme));
    }
    if (updates.settings !== undefined) {
      fields.push('settings = ?');
      values.push(JSON.stringify(updates.settings));
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (fields.length > 0) {
      db.prepare(`UPDATE presentations SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }

    return this.getById(id);
  }

  static delete(id: string): boolean {
    const result = db.prepare('DELETE FROM presentations WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
