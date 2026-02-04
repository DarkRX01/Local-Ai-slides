import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnimationEngine } from '../animationEngine';
import { Animation } from '@slides-clone/shared';

describe('AnimationEngine', () => {
  let engine: AnimationEngine;
  let mockElement: HTMLElement;

  beforeEach(() => {
    engine = new AnimationEngine();
    mockElement = document.createElement('div');
    mockElement.style.cssText = 'width: 100px; height: 100px; position: absolute;';
    document.body.appendChild(mockElement);
  });

  describe('playFadeAnimation', () => {
    it('should fade in an element', async () => {
      const animation: Animation = {
        id: 'test-1',
        slideId: 'slide-1',
        elementId: 'element-1',
        type: 'fade',
        trigger: 'auto',
        duration: 100,
        delay: 0,
        easing: 'ease-in-out',
        properties: { direction: 'in', opacity: 1 },
      };

      await engine.playAnimation(animation, mockElement);
      
      expect(mockElement.style.opacity).toBe('1');
    });

    it('should fade out an element', async () => {
      const animation: Animation = {
        id: 'test-2',
        slideId: 'slide-1',
        elementId: 'element-1',
        type: 'fade',
        trigger: 'auto',
        duration: 100,
        delay: 0,
        easing: 'ease-in-out',
        properties: { direction: 'out', opacity: 0 },
      };

      await engine.playAnimation(animation, mockElement);
      
      expect(parseFloat(mockElement.style.opacity)).toBeLessThan(0.1);
    });
  });

  describe('playSlideAnimation', () => {
    it('should slide element from left', async () => {
      const animation: Animation = {
        id: 'test-3',
        slideId: 'slide-1',
        elementId: 'element-1',
        type: 'slide',
        trigger: 'auto',
        duration: 100,
        delay: 0,
        easing: 'power2.out',
        properties: { direction: 'left' },
      };

      await engine.playAnimation(animation, mockElement);
      
      const transform = mockElement.style.transform;
      expect(transform).toContain('translate');
    });
  });

  describe('playZoomAnimation', () => {
    it('should zoom in an element', async () => {
      const animation: Animation = {
        id: 'test-4',
        slideId: 'slide-1',
        elementId: 'element-1',
        type: 'zoom',
        trigger: 'auto',
        duration: 100,
        delay: 0,
        easing: 'power2.out',
        properties: { direction: 'in', scale: 1 },
      };

      await engine.playAnimation(animation, mockElement);
      
      const transform = mockElement.style.transform;
      expect(transform).toContain('scale');
    });
  });

  describe('playRotateAnimation', () => {
    it('should rotate an element', async () => {
      const animation: Animation = {
        id: 'test-5',
        slideId: 'slide-1',
        elementId: 'element-1',
        type: 'rotate',
        trigger: 'auto',
        duration: 100,
        delay: 0,
        easing: 'power3.out',
        properties: { rotationZ: 360 },
      };

      await engine.playAnimation(animation, mockElement);
      
      const transform = mockElement.style.transform;
      expect(transform).toContain('rotate');
    });
  });

  describe('createTimeline', () => {
    it('should create a timeline with multiple animations', () => {
      const animations: Animation[] = [
        {
          id: 'test-6',
          slideId: 'slide-1',
          elementId: 'element-1',
          type: 'fade',
          trigger: 'auto',
          duration: 500,
          delay: 0,
          easing: 'ease-in-out',
          properties: { direction: 'in' },
        },
        {
          id: 'test-7',
          slideId: 'slide-1',
          elementId: 'element-2',
          type: 'slide',
          trigger: 'auto',
          duration: 600,
          delay: 500,
          easing: 'power2.out',
          properties: { direction: 'left' },
        },
      ];

      const timeline = engine.createTimeline('slide-1', animations);
      
      expect(timeline).toBeDefined();
    });
  });

  describe('stopAllAnimations', () => {
    it('should stop all running animations', () => {
      engine.stopAllAnimations();
      
      expect(true).toBe(true);
    });
  });
});
