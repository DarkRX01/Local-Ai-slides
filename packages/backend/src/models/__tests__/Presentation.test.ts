import { PresentationModel } from '../Presentation';
import { db, initializeDatabase } from '../../utils/database';

describe('PresentationModel', () => {
  beforeAll(() => {
    process.env.DB_PATH = ':memory:';
    initializeDatabase();
  });

  afterEach(() => {
    db.prepare('DELETE FROM presentations').run();
    db.prepare('DELETE FROM slides').run();
  });

  describe('create', () => {
    it('should create a new presentation', () => {
      const presentation = PresentationModel.create({
        title: 'Test Presentation',
        description: 'Test Description'
      });

      expect(presentation).toBeDefined();
      expect(presentation.id).toBeDefined();
      expect(presentation.title).toBe('Test Presentation');
      expect(presentation.description).toBe('Test Description');
      expect(presentation.slides).toEqual([]);
    });

    it('should create presentation with custom theme', () => {
      const presentation = PresentationModel.create({
        title: 'Custom Theme',
        theme: {
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            accent: '#0000ff',
            background: '#ffffff',
            text: '#000000'
          }
        }
      });

      expect(presentation.theme.colors.primary).toBe('#ff0000');
    });
  });

  describe('findById', () => {
    it('should find presentation by id', () => {
      const created = PresentationModel.create({ title: 'Find Test' });
      const found = PresentationModel.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.title).toBe('Find Test');
    });

    it('should return null for non-existent id', () => {
      const found = PresentationModel.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all presentations', () => {
      PresentationModel.create({ title: 'Pres 1' });
      PresentationModel.create({ title: 'Pres 2' });
      PresentationModel.create({ title: 'Pres 3' });

      const all = PresentationModel.findAll();
      expect(all).toHaveLength(3);
    });

    it('should return empty array when no presentations', () => {
      const all = PresentationModel.findAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update presentation title', () => {
      const created = PresentationModel.create({ title: 'Original' });
      const updated = PresentationModel.update(created.id, { title: 'Updated' });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe('Updated');
    });

    it('should return null for non-existent id', () => {
      const updated = PresentationModel.update('non-existent', { title: 'Updated' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete presentation', () => {
      const created = PresentationModel.create({ title: 'To Delete' });
      const deleted = PresentationModel.delete(created.id);

      expect(deleted).toBe(true);
      expect(PresentationModel.findById(created.id)).toBeNull();
    });

    it('should return false for non-existent id', () => {
      const deleted = PresentationModel.delete('non-existent');
      expect(deleted).toBe(false);
    });
  });
});
