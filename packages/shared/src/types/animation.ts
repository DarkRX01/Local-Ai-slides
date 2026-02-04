export type AnimationType = 
  | 'fade' 
  | 'slide' 
  | 'zoom' 
  | 'rotate' 
  | '3d' 
  | 'particle' 
  | 'morph'
  | 'custom';

export type EasingType = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'power1.in'
  | 'power1.out'
  | 'power1.inOut'
  | 'power2.in'
  | 'power2.out'
  | 'power2.inOut'
  | 'power3.in'
  | 'power3.out'
  | 'power3.inOut'
  | 'power4.in'
  | 'power4.out'
  | 'power4.inOut'
  | 'back.in'
  | 'back.out'
  | 'back.inOut'
  | 'elastic.in'
  | 'elastic.out'
  | 'elastic.inOut'
  | 'bounce.in'
  | 'bounce.out'
  | 'bounce.inOut'
  | 'circ.in'
  | 'circ.out'
  | 'circ.inOut'
  | 'expo.in'
  | 'expo.out'
  | 'expo.inOut'
  | 'sine.in'
  | 'sine.out'
  | 'sine.inOut';

export interface Animation {
  id: string;
  slideId: string;
  elementId?: string;
  type: AnimationType;
  trigger: 'auto' | 'click' | 'time';
  duration: number;
  delay: number;
  easing: EasingType;
  properties: AnimationProperties;
  keyframes?: Keyframe[];
  chain?: string[];
  repeat?: number;
  yoyo?: boolean;
  stagger?: number;
}

export interface AnimationProperties {
  from?: Record<string, any>;
  to?: Record<string, any>;
  direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
  intensity?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  x?: number;
  y?: number;
  z?: number;
  skewX?: number;
  skewY?: number;
  perspective?: number;
  transformOrigin?: string;
  particleCount?: number;
  particleSize?: number;
  particleColor?: string;
  particleVelocity?: { x: number; y: number };
  morphPath?: string;
}

export interface Keyframe {
  time: number;
  properties: Record<string, any>;
  easing?: EasingType;
}

export interface AnimationTimeline {
  id: string;
  slideId: string;
  duration: number;
  animations: Animation[];
  repeat?: number;
  yoyo?: boolean;
}

export interface AnimationPreset {
  id: string;
  name: string;
  category: 'entrance' | 'exit' | 'emphasis' | 'motion' | '3d' | 'particle';
  preview: string;
  thumbnail?: string;
  config: Omit<Animation, 'id' | 'elementId' | 'slideId'>;
}

export interface ParticleConfig {
  count: number;
  size: number;
  color: string;
  velocity: { x: number; y: number };
  gravity: number;
  life: number;
  shape: 'circle' | 'square' | 'triangle' | 'star';
}
