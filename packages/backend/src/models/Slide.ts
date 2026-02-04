import { db } from '../utils/database';
import { nanoid } from 'nanoid';
import type { Slide, CreateSlideDto, UpdateSlideDto, Background } from '@presentation-app/shared';

const DEFAULT_BACKGROUND: Background = {
  type: 'color',
  color: '#ffffff'
};

export class SlideModel {
  static create(data: CreateSlideDto): Slide {
    const id = nanoid();
    const background = data.background || DEFAULT_BACKGROUND;

    const maxOrderStmt = db.prepare('SELECT MAX(order_index) as max_order FROM slides WHERE presentation_id = ?');
    const maxOrderResult = maxOrderStmt.get(data.presentationId) as { max_order: number | null };
    const order = data.order !== undefined ? data.order : (maxOrderResult.max_order || -1) + 1;

    const stmt = db.prepare(`
      INSERT INTO slides (id, presentation_id, order_index, elements, animations, background, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.presentationId,
      order,
      JSON.stringify([]),
      JSON.stringify([]),
      JSON.stringify(background),
      data.notes || null
    );

    db.prepare('UPDATE presentations SET updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), data.presentationId);

    return {
      id,
      presentationId: data.presentationId,
      order,
      elements: [],
      animations: [],
      background,
      notes: data.notes
    };
  }

  static findById(id: string): Slide | null {
    const stmt = db.prepare('SELECT * FROM slides WHERE id = ?');
    const row = stmt.get(id) as any;

    if (!row) return null;

    return {
      id: row.id,
      presentationId: row.presentation_id,
      order: row.order_index,
      elements: JSON.parse(row.elements),
      animations: JSON.parse(row.animations),
      background: JSON.parse(row.background),
      notes: row.notes
    };
  }

  static findByPresentationId(presentationId: string): Slide[] {
    const stmt = db.prepare('SELECT * FROM slides WHERE presentation_id = ? ORDER BY order_index ASC');
    const rows = stmt.all(presentationId) as any[];

    return rows.map(row => ({
      id: row.id,
      presentationId: row.presentation_id,
      order: row.order_index,
      elements: JSON.parse(row.elements),
      animations: JSON.parse(row.animations),
      background: JSON.parse(row.background),
      notes: row.notes
    }));
  }

  static update(id: string, data: UpdateSlideDto): Slide | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.order !== undefined) {
      updates.push('order_index = ?');
      values.push(data.order);
    }

    if (data.elements !== undefined) {
      updates.push('elements = ?');
      values.push(JSON.stringify(data.elements));
    }

    if (data.animations !== undefined) {
      updates.push('animations = ?');
      values.push(JSON.stringify(data.animations));
    }

    if (data.background !== undefined) {
      updates.push('background = ?');
      values.push(JSON.stringify(data.background));
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      values.push(data.notes);
    }

    if (updates.length === 0) return existing;

    values.push(id);

    const stmt = db.prepare(`
      UPDATE slides
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    db.prepare('UPDATE presentations SET updated_at = ? WHERE id = ?')
      .run(new Date().toISOString(), existing.presentationId);

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const slide = this.findById(id);
    if (!slide) return false;

    const stmt = db.prepare('DELETE FROM slides WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes > 0) {
      db.prepare('UPDATE presentations SET updated_at = ? WHERE id = ?')
        .run(new Date().toISOString(), slide.presentationId);
    }

    return result.changes > 0;
  }

  static reorder(presentationId: string, slideOrders: { id: string; order: number }[]): boolean {
    const updateStmt = db.prepare('UPDATE slides SET order_index = ? WHERE id = ?');

    const transaction = db.transaction(() => {
      for (const { id, order } of slideOrders) {
        updateStmt.run(order, id);
      }
      db.prepare('UPDATE presentations SET updated_at = ? WHERE id = ?')
        .run(new Date().toISOString(), presentationId);
    });

    try {
      transaction();
      return true;
    } catch (error) {
      return false;
    }
  }
}
