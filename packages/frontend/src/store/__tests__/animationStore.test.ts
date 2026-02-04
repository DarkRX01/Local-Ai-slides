import { describe, it, expect, beforeEach } from 'vitest';
import { useAnimationStore } from '../animationStore';
import { Animation } from '@slides-clone/shared';

describe('AnimationStore', () => {
  beforeEach(() => {
    useAnimationStore.setState({
      animations: [],
      timelines: {},
      selectedAnimationId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 5000,
      history: { past: [], present: [], future: [] },
      playbackSpeed: 1,
      loopEnabled: false,
    });
  });

  describe('addAnimation', () => {
    it('should add an animation to the store', () => {
      const animation: Animation = {
        id: 'anim-1',
        slideId: 'slide-1',
        elementId: 'element-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: { direction: 'in' },
      };

      useAnimationStore.getState().addAnimation(animation);
      
      expect(useAnimationStore.getState().animations).toHaveLength(1);
      expect(useAnimationStore.getState().animations[0]).toEqual(animation);
    });

    it('should save to history when adding animation', () => {
      const animation: Animation = {
        id: 'anim-2',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
      };

      useAnimationStore.getState().addAnimation(animation);
      
      expect(useAnimationStore.getState().history.past).toHaveLength(1);
    });
  });

  describe('updateAnimation', () => {
    it('should update an existing animation', () => {
      const animation: Animation = {
        id: 'anim-3',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().updateAnimation('anim-3', { duration: 1000 });
      
      const updated = useAnimationStore.getState().animations.find(a => a.id === 'anim-3');
      expect(updated?.duration).toBe(1000);
    });
  });

  describe('deleteAnimation', () => {
    it('should delete an animation', () => {
      const animation: Animation = {
        id: 'anim-4',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
      };

      useAnimationStore.getState().addAnimation(animation);
      expect(useAnimationStore.getState().animations).toHaveLength(1);
      
      useAnimationStore.getState().deleteAnimation('anim-4');
      expect(useAnimationStore.getState().animations).toHaveLength(0);
    });

    it('should clear selection when deleting selected animation', () => {
      const animation: Animation = {
        id: 'anim-5',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().setSelectedAnimation('anim-5');
      
      expect(useAnimationStore.getState().selectedAnimationId).toBe('anim-5');
      
      useAnimationStore.getState().deleteAnimation('anim-5');
      expect(useAnimationStore.getState().selectedAnimationId).toBeNull();
    });
  });

  describe('duplicateAnimation', () => {
    it('should create a copy of an animation', () => {
      const animation: Animation = {
        id: 'anim-6',
        slideId: 'slide-1',
        type: 'zoom',
        trigger: 'auto',
        duration: 700,
        delay: 100,
        easing: 'power2.out',
        properties: { scale: 1.5 },
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().duplicateAnimation('anim-6');
      
      expect(useAnimationStore.getState().animations).toHaveLength(2);
      expect(useAnimationStore.getState().animations[1].delay).toBe(200);
    });
  });

  describe('playback controls', () => {
    it('should toggle play state', () => {
      expect(useAnimationStore.getState().isPlaying).toBe(false);
      
      useAnimationStore.getState().play();
      expect(useAnimationStore.getState().isPlaying).toBe(true);
      
      useAnimationStore.getState().pause();
      expect(useAnimationStore.getState().isPlaying).toBe(false);
    });

    it('should reset currentTime on stop', () => {
      useAnimationStore.setState({ currentTime: 2500 });
      
      useAnimationStore.getState().stop();
      expect(useAnimationStore.getState().currentTime).toBe(0);
      expect(useAnimationStore.getState().isPlaying).toBe(false);
    });

    it('should update playback speed', () => {
      useAnimationStore.getState().setPlaybackSpeed(2);
      expect(useAnimationStore.getState().playbackSpeed).toBe(2);
    });
  });

  describe('timeline management', () => {
    it('should create a timeline for a slide', () => {
      const animations: Animation[] = [
        {
          id: 'anim-7',
          slideId: 'slide-1',
          type: 'fade',
          trigger: 'auto',
          duration: 500,
          delay: 0,
          easing: 'ease-in-out',
          properties: {},
        },
        {
          id: 'anim-8',
          slideId: 'slide-1',
          type: 'slide',
          trigger: 'auto',
          duration: 600,
          delay: 500,
          easing: 'power2.out',
          properties: {},
        },
      ];

      useAnimationStore.getState().createTimeline('slide-1', animations);
      
      expect(useAnimationStore.getState().timelines['slide-1']).toBeDefined();
      expect(useAnimationStore.getState().timelines['slide-1'].animations).toHaveLength(2);
    });

    it('should delete a timeline', () => {
      useAnimationStore.getState().createTimeline('slide-2', []);
      expect(useAnimationStore.getState().timelines['slide-2']).toBeDefined();
      
      useAnimationStore.getState().deleteTimeline('slide-2');
      expect(useAnimationStore.getState().timelines['slide-2']).toBeUndefined();
    });
  });

  describe('animation chaining', () => {
    it('should chain animations sequentially', () => {
      const animations: Animation[] = [
        {
          id: 'anim-9',
          slideId: 'slide-1',
          type: 'fade',
          trigger: 'auto',
          duration: 500,
          delay: 0,
          easing: 'ease-in-out',
          properties: {},
        },
        {
          id: 'anim-10',
          slideId: 'slide-1',
          type: 'slide',
          trigger: 'auto',
          duration: 600,
          delay: 0,
          easing: 'power2.out',
          properties: {},
        },
      ];

      animations.forEach(a => useAnimationStore.getState().addAnimation(a));
      useAnimationStore.getState().chainAnimations(['anim-9', 'anim-10']);
      
      const chained = useAnimationStore.getState().animations;
      expect(chained[0].delay).toBe(0);
      expect(chained[1].delay).toBe(500);
    });

    it('should unchain animations', () => {
      const animation: Animation = {
        id: 'anim-11',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
        chain: ['anim-11', 'anim-12'],
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().unchainAnimations(['anim-11']);
      
      const unchained = useAnimationStore.getState().animations[0];
      expect(unchained.chain).toBeUndefined();
    });
  });

  describe('keyframe management', () => {
    it('should add a keyframe to an animation', () => {
      const animation: Animation = {
        id: 'anim-12',
        slideId: 'slide-1',
        type: 'custom',
        trigger: 'auto',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
        keyframes: [],
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().addKeyframe('anim-12', {
        time: 500,
        properties: { x: 100 },
        easing: 'power2.out',
      });
      
      const updated = useAnimationStore.getState().animations[0];
      expect(updated.keyframes).toHaveLength(1);
    });

    it('should update a keyframe', () => {
      const animation: Animation = {
        id: 'anim-13',
        slideId: 'slide-1',
        type: 'custom',
        trigger: 'auto',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
        keyframes: [{ time: 500, properties: { x: 100 }, easing: 'ease-in-out' }],
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().updateKeyframe('anim-13', 0, { time: 600 });
      
      const updated = useAnimationStore.getState().animations[0];
      expect(updated.keyframes?.[0].time).toBe(600);
    });

    it('should delete a keyframe', () => {
      const animation: Animation = {
        id: 'anim-14',
        slideId: 'slide-1',
        type: 'custom',
        trigger: 'auto',
        duration: 1000,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
        keyframes: [
          { time: 300, properties: { x: 50 }, easing: 'ease-in-out' },
          { time: 600, properties: { x: 100 }, easing: 'ease-in-out' },
        ],
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().deleteKeyframe('anim-14', 0);
      
      const updated = useAnimationStore.getState().animations[0];
      expect(updated.keyframes).toHaveLength(1);
    });
  });

  describe('filtering animations', () => {
    it('should get animations by slide', () => {
      const animations: Animation[] = [
        {
          id: 'anim-15',
          slideId: 'slide-1',
          type: 'fade',
          trigger: 'auto',
          duration: 500,
          delay: 0,
          easing: 'ease-in-out',
          properties: {},
        },
        {
          id: 'anim-16',
          slideId: 'slide-2',
          type: 'slide',
          trigger: 'auto',
          duration: 600,
          delay: 0,
          easing: 'power2.out',
          properties: {},
        },
      ];

      animations.forEach(a => useAnimationStore.getState().addAnimation(a));
      
      const slide1Animations = useAnimationStore.getState().getAnimationsBySlide('slide-1');
      expect(slide1Animations).toHaveLength(1);
      expect(slide1Animations[0].id).toBe('anim-15');
    });

    it('should get animations by element', () => {
      const animations: Animation[] = [
        {
          id: 'anim-17',
          slideId: 'slide-1',
          elementId: 'element-1',
          type: 'fade',
          trigger: 'auto',
          duration: 500,
          delay: 0,
          easing: 'ease-in-out',
          properties: {},
        },
        {
          id: 'anim-18',
          slideId: 'slide-1',
          elementId: 'element-2',
          type: 'slide',
          trigger: 'auto',
          duration: 600,
          delay: 0,
          easing: 'power2.out',
          properties: {},
        },
      ];

      animations.forEach(a => useAnimationStore.getState().addAnimation(a));
      
      const element1Animations = useAnimationStore.getState().getAnimationsByElement('element-1');
      expect(element1Animations).toHaveLength(1);
      expect(element1Animations[0].id).toBe('anim-17');
    });
  });

  describe('undo/redo', () => {
    it('should undo animation addition', () => {
      const animation: Animation = {
        id: 'anim-19',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
      };

      useAnimationStore.getState().addAnimation(animation);
      expect(useAnimationStore.getState().animations).toHaveLength(1);
      
      useAnimationStore.getState().undo();
      expect(useAnimationStore.getState().animations).toHaveLength(0);
    });

    it('should redo animation addition', () => {
      const animation: Animation = {
        id: 'anim-20',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
      };

      useAnimationStore.getState().addAnimation(animation);
      useAnimationStore.getState().undo();
      expect(useAnimationStore.getState().animations).toHaveLength(0);
      
      useAnimationStore.getState().redo();
      expect(useAnimationStore.getState().animations).toHaveLength(1);
    });

    it('should check if can undo', () => {
      expect(useAnimationStore.getState().canUndo()).toBe(false);
      
      const animation: Animation = {
        id: 'anim-21',
        slideId: 'slide-1',
        type: 'fade',
        trigger: 'auto',
        duration: 500,
        delay: 0,
        easing: 'ease-in-out',
        properties: {},
      };

      useAnimationStore.getState().addAnimation(animation);
      expect(useAnimationStore.getState().canUndo()).toBe(true);
    });
  });
});
