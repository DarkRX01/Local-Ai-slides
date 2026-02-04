import { SlideModel } from '../Slide';
import { PresentationModel } from '../Presentation';
import { db, initializeDatabase } from '../../utils/database';

describe('SlideModel', () => {
  let presentationId: string;

  beforeAll(() => {
    process.env.DB_PATH = ':memory:';
    initializeDatabase();
  });

  beforeEach(() => {
    const presentation = PresentationModel.create({ title: 'Test' });
    presentationId = presentation.id;
  });

  afterEach(() => {
    db.prepare('DELETE FROM presentations').run();
    db.prepare('DELETE FROM slides').run();
  });

  describe('create', () => {
    it('should create a new slide', () => {
      const slide = SlideModel.create({
        presentationId
      });

      expect(slide).toBeDefined();
      expect(slide.id).toBeDefined();
      expect(slide.presentationId).toBe(presentationId);
      expect(slide.order).toBe(0);
      expect(slide.elements).toEqual([]);
      expect(slide.animations).toEqual([]);
    });

    it('should auto-increment order', () => {
      const slide1 = SlideModel.create({ presentationId });
      const slide2 = SlideModel.create({ presentationId });
      const slide3 = SlideModel.create({ presentationId });

      expect(slide1.order).toBe(0);
      expect(slide2.order).toBe(1);
      expect(slide3.order).toBe(2);
    });

    it('should use provided order', () => {
      const slide = SlideModel.create({
        presentationId,
        order: 5
      });

      expect(slide.order).toBe(5);
    });
  });

  describe('findById', () => {
    it('should find slide by id', () => {
      const created = SlideModel.create({ presentationId });
      const found = SlideModel.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for non-existent id', () => {
      const found = SlideModel.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findByPresentationId', () => {
    it('should find all slides for a presentation', () => {
      SlideModel.create({ presentationId });
      SlideModel.create({ presentationId });
      SlideModel.create({ presentationId });

      const slides = SlideModel.findByPresentationId(presentationId);
      expect(slides).toHaveLength(3);
    });

    it('should return empty array for presentation with no slides', () => {
      const slides = SlideModel.findByPresentationId(presentationId);
      expect(slides).toEqual([]);
    });

    it('should order slides by order_index', () => {
      SlideModel.create({ presentationId, order: 2 });
      SlideModel.create({ presentationId, order: 0 });
      SlideModel.create({ presentationId, order: 1 });

      const slides = SlideModel.findByPresentationId(presentationId);
      expect(slides[0].order).toBe(0);
      expect(slides[1].order).toBe(1);
      expect(slides[2].order).toBe(2);
    });
  });

  describe('update', () => {
    it('should update slide', () => {
      const created = SlideModel.create({ presentationId });
      const updated = SlideModel.update(created.id, {
        notes: 'Test notes'
      });

      expect(updated).toBeDefined();
      expect(updated?.notes).toBe('Test notes');
    });

    it('should return null for non-existent id', () => {
      const updated = SlideModel.update('non-existent', { notes: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete slide', () => {
      const created = SlideModel.create({ presentationId });
      const deleted = SlideModel.delete(created.id);

      expect(deleted).toBe(true);
      expect(SlideModel.findById(created.id)).toBeNull();
    });

    it('should return false for non-existent id', () => {
      const deleted = SlideModel.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('reorder', () => {
    it('should reorder slides', () => {
      const slide1 = SlideModel.create({ presentationId, order: 0 });
      const slide2 = SlideModel.create({ presentationId, order: 1 });
      const slide3 = SlideModel.create({ presentationId, order: 2 });

      const success = SlideModel.reorder(presentationId, [
        { id: slide3.id, order: 0 },
        { id: slide1.id, order: 1 },
        { id: slide2.id, order: 2 }
      ]);

      expect(success).toBe(true);

      const slides = SlideModel.findByPresentationId(presentationId);
      expect(slides[0].id).toBe(slide3.id);
      expect(slides[1].id).toBe(slide1.id);
      expect(slides[2].id).toBe(slide2.id);
    });
  });
});
