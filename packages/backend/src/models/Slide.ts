import { db } from '../utils/database';
import type { Slide } from '@slides-clone/shared';

export class SlideModel {
  static getById(id: string): Slide | null {
    const row = db.prepare('SELECT * FROM slides WHERE id = ?').get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      presentationId: row.presentation_id,
      order: row.order_index,
      elements: JSON.parse(row.elements),
      animations: JSON.parse(row.animations),
      background: JSON.parse(row.background),
      notes: row.notes || undefined,
    };
  }

  static getByPresentationId(presentationId: string): Slide[] {
    const rows = db.prepare('SELECT * FROM slides WHERE presentation_id = ? ORDER BY order_index ASC').all(presentationId);
    return rows.map((row: any) => ({
      id: row.id,
      presentationId: row.presentation_id,
      order: row.order_index,
      elements: JSON.parse(row.elements),
      animations: JSON.parse(row.animations),
      background: JSON.parse(row.background),
      notes: row.notes || undefined,
    }));
  }

  static create(slide: Slide): Slide {
    db.prepare(`
      INSERT INTO slides (id, presentation_id, order_index, elements, animations, background, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      slide.id,
      slide.presentationId,
      slide.order,
      JSON.stringify(slide.elements),
      JSON.stringify(slide.animations),
      JSON.stringify(slide.background),
      slide.notes || null
    );

    db.prepare('UPDATE presentations SET updated_at = ? WHERE id = ?').run(
      new Date().toISOString(),
      slide.presentationId
    );

    return slide;
  }

  static update(id: string, updates: Partial<Slide>): Slide | null {
    const existing = this.getById(id);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.order !== undefined) {
      fields.push('order_index = ?');
      values.push(updates.order);
    }
    if (updates.elements !== undefined) {
      fields.push('elements = ?');
      values.push(JSON.stringify(updates.elements));
    }
    if (updates.animations !== undefined) {
      fields.push('animations = ?');
      values.push(JSON.stringify(updates.animations));
    }
    if (updates.background !== undefined) {
      fields.push('background = ?');
      values.push(JSON.stringify(updates.background));
    }
    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes);
    }

    values.push(id);

    if (fields.length > 0) {
      db.prepare(`UPDATE slides SET ${fields.join(', ')} WHERE id = ?`).run(...values);

      db.prepare('UPDATE presentations SET updated_at = ? WHERE id = ?').run(
        new Date().toISOString(),
        existing.presentationId
      );
    }

    return this.getById(id);
  }

  static delete(id: string): boolean {
    const slide = this.getById(id);
    if (!slide) return false;

    const result = db.prepare('DELETE FROM slides WHERE id = ?').run(id);

    if (result.changes > 0) {
      db.prepare('UPDATE presentations SET updated_at = ? WHERE id = ?').run(
        new Date().toISOString(),
        slide.presentationId
      );
    }

    return result.changes > 0;
  }

  static duplicate(id: string, newId: string): Slide | null {
    const slide = this.getById(id);
    if (!slide) return null;

    const slides = this.getByPresentationId(slide.presentationId);
    const maxOrder = Math.max(...slides.map(s => s.order), -1);

    const duplicated: Slide = {
      ...slide,
      id: newId,
      order: maxOrder + 1,
    };

    return this.create(duplicated);
  }
}
