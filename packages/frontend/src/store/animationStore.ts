import { create } from 'zustand';
import { Animation, AnimationTimeline, AnimationPreset, Keyframe } from '@slides-clone/shared';
import { animationPresets } from '@/lib/animationPresets';

interface AnimationHistory {
  past: Animation[][];
  present: Animation[];
  future: Animation[][];
}

interface AnimationState {
  animations: Animation[];
  timelines: Record<string, AnimationTimeline>;
  selectedAnimationId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  presets: AnimationPreset[];
  history: AnimationHistory;
  playbackSpeed: number;
  loopEnabled: boolean;

  addAnimation: (animation: Animation) => void;
  addAnimations: (animations: Animation[]) => void;
  updateAnimation: (id: string, updates: Partial<Animation>) => void;
  deleteAnimation: (id: string) => void;
  duplicateAnimation: (id: string) => void;
  setSelectedAnimation: (id: string | null) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  applyPreset: (slideId: string, elementId: string, preset: AnimationPreset) => void;
  
  createTimeline: (slideId: string, animations: Animation[]) => void;
  updateTimeline: (slideId: string, updates: Partial<AnimationTimeline>) => void;
  deleteTimeline: (slideId: string) => void;
  
  chainAnimations: (animationIds: string[]) => void;
  unchainAnimations: (animationIds: string[]) => void;
  
  addKeyframe: (animationId: string, keyframe: Keyframe) => void;
  updateKeyframe: (animationId: string, keyframeIndex: number, updates: Partial<Keyframe>) => void;
  deleteKeyframe: (animationId: string, keyframeIndex: number) => void;
  
  getAnimationsBySlide: (slideId: string) => Animation[];
  getAnimationsByElement: (elementId: string) => Animation[];
  
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  clearHistory: () => void;
  resetAnimations: () => void;
}

const saveToHistory = (state: AnimationState): AnimationHistory => ({
  past: [...state.history.past, state.history.present],
  present: state.animations,
  future: [],
});

export const useAnimationStore = create<AnimationState>((set, get) => ({
  animations: [],
  timelines: {},
  selectedAnimationId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 5000,
  presets: animationPresets,
  history: {
    past: [],
    present: [],
    future: [],
  },
  playbackSpeed: 1,
  loopEnabled: false,

  addAnimation: (animation) =>
    set((state) => ({
      animations: [...state.animations, animation],
      history: saveToHistory(state),
    })),

  addAnimations: (animations) =>
    set((state) => ({
      animations: [...state.animations, ...animations],
      history: saveToHistory(state),
    })),

  updateAnimation: (id, updates) =>
    set((state) => ({
      animations: state.animations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      history: saveToHistory(state),
    })),

  deleteAnimation: (id) =>
    set((state) => ({
      animations: state.animations.filter((a) => a.id !== id),
      selectedAnimationId: state.selectedAnimationId === id ? null : state.selectedAnimationId,
      history: saveToHistory(state),
    })),

  duplicateAnimation: (id) =>
    set((state) => {
      const animation = state.animations.find((a) => a.id === id);
      if (!animation) return state;

      const newAnimation: Animation = {
        ...animation,
        id: `anim-${Date.now()}`,
        delay: animation.delay + 100,
      };

      return {
        animations: [...state.animations, newAnimation],
        history: saveToHistory(state),
      };
    }),

  setSelectedAnimation: (id) => set({ selectedAnimationId: id }),

  play: () => set({ isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  stop: () => set({ isPlaying: false, currentTime: 0 }),

  setCurrentTime: (time) => set({ currentTime: time }),

  setDuration: (duration) => set({ duration }),

  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  setLoopEnabled: (enabled) => set({ loopEnabled: enabled }),

  applyPreset: (slideId, elementId, preset) => {
    const animation: Animation = {
      id: `anim-${Date.now()}`,
      slideId,
      elementId,
      ...preset.config,
    };
    set((state) => ({
      animations: [...state.animations, animation],
      history: saveToHistory(state),
    }));
  },

  createTimeline: (slideId, animations) =>
    set((state) => {
      const maxTime = Math.max(
        ...animations.map((a) => a.delay + a.duration),
        state.duration
      );

      const timeline: AnimationTimeline = {
        id: `timeline-${slideId}`,
        slideId,
        duration: maxTime,
        animations,
      };

      return {
        timelines: {
          ...state.timelines,
          [slideId]: timeline,
        },
        duration: maxTime,
      };
    }),

  updateTimeline: (slideId, updates) =>
    set((state) => ({
      timelines: {
        ...state.timelines,
        [slideId]: {
          ...state.timelines[slideId],
          ...updates,
        },
      },
    })),

  deleteTimeline: (slideId) =>
    set((state) => {
      const { [slideId]: _, ...rest } = state.timelines;
      return { timelines: rest };
    }),

  chainAnimations: (animationIds) =>
    set((state) => {
      const animations = animationIds
        .map((id) => state.animations.find((a) => a.id === id))
        .filter(Boolean) as Animation[];

      let totalDelay = 0;
      const updatedAnimations = state.animations.map((anim) => {
        const index = animationIds.indexOf(anim.id);
        if (index === -1) return anim;

        const updated = {
          ...anim,
          delay: totalDelay,
          chain: animationIds,
        };
        totalDelay += anim.duration;
        return updated;
      });

      return {
        animations: updatedAnimations,
        history: saveToHistory(state),
      };
    }),

  unchainAnimations: (animationIds) =>
    set((state) => ({
      animations: state.animations.map((a) =>
        animationIds.includes(a.id) ? { ...a, chain: undefined } : a
      ),
      history: saveToHistory(state),
    })),

  addKeyframe: (animationId, keyframe) =>
    set((state) => ({
      animations: state.animations.map((a) =>
        a.id === animationId
          ? {
              ...a,
              keyframes: [...(a.keyframes || []), keyframe].sort((k1, k2) => k1.time - k2.time),
            }
          : a
      ),
      history: saveToHistory(state),
    })),

  updateKeyframe: (animationId, keyframeIndex, updates) =>
    set((state) => ({
      animations: state.animations.map((a) => {
        if (a.id !== animationId || !a.keyframes) return a;

        const keyframes = [...a.keyframes];
        keyframes[keyframeIndex] = { ...keyframes[keyframeIndex], ...updates };

        return { ...a, keyframes: keyframes.sort((k1, k2) => k1.time - k2.time) };
      }),
      history: saveToHistory(state),
    })),

  deleteKeyframe: (animationId, keyframeIndex) =>
    set((state) => ({
      animations: state.animations.map((a) => {
        if (a.id !== animationId || !a.keyframes) return a;

        const keyframes = a.keyframes.filter((_, i) => i !== keyframeIndex);
        return { ...a, keyframes };
      }),
      history: saveToHistory(state),
    })),

  getAnimationsBySlide: (slideId) => {
    return get().animations.filter((a) => a.slideId === slideId);
  },

  getAnimationsByElement: (elementId) => {
    return get().animations.filter((a) => a.elementId === elementId);
  },

  undo: () =>
    set((state) => {
      if (state.history.past.length === 0) return state;

      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);

      return {
        animations: previous,
        history: {
          past: newPast,
          present: previous,
          future: [state.history.present, ...state.history.future],
        },
      };
    }),

  redo: () =>
    set((state) => {
      if (state.history.future.length === 0) return state;

      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);

      return {
        animations: next,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: newFuture,
        },
      };
    }),

  canUndo: () => get().history.past.length > 0,

  canRedo: () => get().history.future.length > 0,

  clearHistory: () =>
    set({
      history: {
        past: [],
        present: [],
        future: [],
      },
    }),

  resetAnimations: () =>
    set((state) => ({
      animations: [],
      timelines: {},
      selectedAnimationId: null,
      isPlaying: false,
      currentTime: 0,
      history: saveToHistory(state),
    })),
}));
