import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../editorStore';
import { SlideElement } from '@/types';

describe('EditorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it('should set selected elements', () => {
    useEditorStore.getState().setSelectedElements(['el-1', 'el-2']);
    expect(useEditorStore.getState().selectedElementIds).toEqual(['el-1', 'el-2']);
  });

  it('should add selected element', () => {
    useEditorStore.getState().addSelectedElement('el-1');
    expect(useEditorStore.getState().selectedElementIds).toContain('el-1');

    useEditorStore.getState().addSelectedElement('el-2');
    expect(useEditorStore.getState().selectedElementIds).toEqual(['el-1', 'el-2']);
  });

  it('should not add duplicate selected element', () => {
    useEditorStore.getState().addSelectedElement('el-1');
    useEditorStore.getState().addSelectedElement('el-1');
    expect(useEditorStore.getState().selectedElementIds).toEqual(['el-1']);
  });

  it('should remove selected element', () => {
    useEditorStore.getState().setSelectedElements(['el-1', 'el-2', 'el-3']);
    useEditorStore.getState().removeSelectedElement('el-2');
    expect(useEditorStore.getState().selectedElementIds).toEqual(['el-1', 'el-3']);
  });

  it('should clear selection', () => {
    useEditorStore.getState().setSelectedElements(['el-1', 'el-2']);
    useEditorStore.getState().clearSelection();
    expect(useEditorStore.getState().selectedElementIds).toEqual([]);
  });

  it('should copy and paste elements', () => {
    const element: SlideElement = {
      id: 'el-1',
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      rotation: 0,
      zIndex: 1,
      opacity: 1,
      data: {
        content: 'Test',
        fontSize: 16,
        fontFamily: 'Inter',
        fontWeight: 400,
        color: '#000000',
        align: 'left',
        lineHeight: 1.5,
      },
    };

    useEditorStore.getState().copy([element]);
    const pasted = useEditorStore.getState().paste();

    expect(pasted).toHaveLength(1);
    expect(pasted[0].x).toBe(120);
    expect(pasted[0].y).toBe(120);
    expect(pasted[0].id).not.toBe(element.id);
  });

  it('should track history', () => {
    const elements: SlideElement[] = [
      {
        id: 'el-1',
        type: 'text',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
        zIndex: 1,
        opacity: 1,
        data: {
          content: 'Test',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: 400,
          color: '#000000',
          align: 'left',
          lineHeight: 1.5,
        },
      },
    ];

    useEditorStore.getState().addToHistory('slide-1', []);
    useEditorStore.getState().addToHistory('slide-1', elements);
    expect(useEditorStore.getState().canUndo()).toBe(true);
    expect(useEditorStore.getState().canRedo()).toBe(false);
  });

  it('should undo and redo', () => {
    const elements1: SlideElement[] = [];
    const elements2: SlideElement[] = [
      {
        id: 'el-1',
        type: 'text',
        x: 100,
        y: 100,
        width: 200,
        height: 100,
        rotation: 0,
        zIndex: 1,
        opacity: 1,
        data: {
          content: 'Test',
          fontSize: 16,
          fontFamily: 'Inter',
          fontWeight: 400,
          color: '#000000',
          align: 'left',
          lineHeight: 1.5,
        },
      },
    ];

    useEditorStore.getState().addToHistory('slide-1', elements1);
    useEditorStore.getState().addToHistory('slide-1', elements2);

    expect(useEditorStore.getState().canUndo()).toBe(true);
    const undone = useEditorStore.getState().undo();
    expect(undone?.elements).toEqual(elements1);

    expect(useEditorStore.getState().canRedo()).toBe(true);
    const redone = useEditorStore.getState().redo();
    expect(redone?.elements).toEqual(elements2);
  });

  it('should set zoom level', () => {
    useEditorStore.getState().setZoom(1.5);
    expect(useEditorStore.getState().zoom).toBe(1.5);

    useEditorStore.getState().setZoom(10);
    expect(useEditorStore.getState().zoom).toBe(5);

    useEditorStore.getState().setZoom(0.01);
    expect(useEditorStore.getState().zoom).toBe(0.1);
  });

  it('should toggle grid', () => {
    const initialGrid = useEditorStore.getState().showGrid;
    useEditorStore.getState().toggleGrid();
    expect(useEditorStore.getState().showGrid).toBe(!initialGrid);
  });
});
