import { describe, it, expect, beforeEach } from 'vitest';
import { usePresentationStore } from '../presentationStore';
import { Presentation, Slide } from '@/types';

describe('PresentationStore', () => {
  beforeEach(() => {
    usePresentationStore.setState({
      presentations: [],
      currentPresentation: null,
      currentSlideIndex: 0,
      loading: false,
      error: null,
    });
  });

  it('should set current presentation', () => {
    const presentation: Presentation = {
      id: 'test-1',
      title: 'Test Presentation',
      slides: [],
      theme: {
        name: 'default',
        mode: 'light',
        colors: {
          primary: '#0ea5e9',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          background: '#ffffff',
          foreground: '#0f172a',
          border: '#e2e8f0',
          panel: '#f8fafc',
        },
        fonts: { heading: 'Inter', body: 'Inter' },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    usePresentationStore.getState().setCurrentPresentation(presentation);
    expect(usePresentationStore.getState().currentPresentation).toEqual(presentation);
    expect(usePresentationStore.getState().currentSlideIndex).toBe(0);
  });

  it('should add presentation', () => {
    const presentation: Presentation = {
      id: 'test-1',
      title: 'Test Presentation',
      slides: [],
      theme: {
        name: 'default',
        mode: 'light',
        colors: {
          primary: '#0ea5e9',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          background: '#ffffff',
          foreground: '#0f172a',
          border: '#e2e8f0',
          panel: '#f8fafc',
        },
        fonts: { heading: 'Inter', body: 'Inter' },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    usePresentationStore.getState().addPresentation(presentation);
    expect(usePresentationStore.getState().presentations).toHaveLength(1);
    expect(usePresentationStore.getState().presentations[0]).toEqual(presentation);
  });

  it('should add slide to presentation', () => {
    const presentation: Presentation = {
      id: 'test-1',
      title: 'Test Presentation',
      slides: [],
      theme: {
        name: 'default',
        mode: 'light',
        colors: {
          primary: '#0ea5e9',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          background: '#ffffff',
          foreground: '#0f172a',
          border: '#e2e8f0',
          panel: '#f8fafc',
        },
        fonts: { heading: 'Inter', body: 'Inter' },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const slide: Slide = {
      id: 'slide-1',
      presentationId: 'test-1',
      order: 0,
      elements: [],
    };

    usePresentationStore.getState().addPresentation(presentation);
    usePresentationStore.getState().setCurrentPresentation(presentation);
    usePresentationStore.getState().addSlide('test-1', slide);

    const updatedPresentation = usePresentationStore.getState().presentations[0];
    expect(updatedPresentation.slides).toHaveLength(1);
    expect(updatedPresentation.slides[0]).toEqual(slide);
  });

  it('should set loading state', () => {
    usePresentationStore.getState().setLoading(true);
    expect(usePresentationStore.getState().loading).toBe(true);

    usePresentationStore.getState().setLoading(false);
    expect(usePresentationStore.getState().loading).toBe(false);
  });

  it('should set error state', () => {
    const errorMessage = 'Test error';
    usePresentationStore.getState().setError(errorMessage);
    expect(usePresentationStore.getState().error).toBe(errorMessage);

    usePresentationStore.getState().setError(null);
    expect(usePresentationStore.getState().error).toBeNull();
  });
});
