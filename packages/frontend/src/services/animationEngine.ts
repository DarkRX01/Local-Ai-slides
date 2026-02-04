import gsap from 'gsap';
import { Animation, AnimationType, EasingType, Keyframe, ParticleConfig } from '@slides-clone/shared';
import * as THREE from 'three';

export class AnimationEngine {
  private timelines: Map<string, gsap.core.Timeline> = new Map();
  private activeAnimations: Set<string> = new Set();
  private particleSystems: Map<string, ParticleSystem> = new Map();
  private threeRenderer?: THREE.WebGLRenderer;
  private threeScene?: THREE.Scene;
  private threeCamera?: THREE.PerspectiveCamera;

  constructor() {
    gsap.registerPlugin();
  }

  async playAnimation(animation: Animation, element: HTMLElement | null): Promise<void> {
    if (!element) {
      console.warn(`Element not found for animation ${animation.id}`);
      return;
    }

    this.activeAnimations.add(animation.id);

    try {
      switch (animation.type) {
        case 'fade':
          await this.playFadeAnimation(animation, element);
          break;
        case 'slide':
          await this.playSlideAnimation(animation, element);
          break;
        case 'zoom':
          await this.playZoomAnimation(animation, element);
          break;
        case 'rotate':
          await this.playRotateAnimation(animation, element);
          break;
        case '3d':
          await this.play3DAnimation(animation, element);
          break;
        case 'particle':
          await this.playParticleAnimation(animation, element);
          break;
        case 'morph':
          await this.playMorphAnimation(animation, element);
          break;
        case 'custom':
          await this.playCustomAnimation(animation, element);
          break;
        default:
          console.warn(`Unknown animation type: ${animation.type}`);
      }
    } finally {
      this.activeAnimations.delete(animation.id);
    }
  }

  private async playFadeAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, easing, properties } = animation;
    const direction = properties.direction || 'in';
    
    const fromOpacity = direction === 'in' ? 0 : 1;
    const toOpacity = direction === 'in' ? 1 : 0;

    gsap.set(element, { opacity: fromOpacity });
    
    return new Promise((resolve) => {
      gsap.to(element, {
        opacity: toOpacity,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: this.convertEasing(easing),
        onComplete: resolve,
      });
    });
  }

  private async playSlideAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, easing, properties } = animation;
    const direction = properties.direction || 'left';
    
    let fromX = 0, fromY = 0;
    const rect = element.getBoundingClientRect();

    switch (direction) {
      case 'left':
        fromX = -rect.width - 100;
        break;
      case 'right':
        fromX = rect.width + 100;
        break;
      case 'up':
        fromY = -rect.height - 100;
        break;
      case 'down':
        fromY = rect.height + 100;
        break;
    }

    gsap.set(element, { x: fromX, y: fromY });
    
    return new Promise((resolve) => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: this.convertEasing(easing),
        onComplete: resolve,
      });
    });
  }

  private async playZoomAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, easing, properties } = animation;
    const direction = properties.direction || 'in';
    const targetScale = properties.scale || 1;
    
    const fromScale = direction === 'in' ? 0 : 1;
    const toScale = direction === 'in' ? targetScale : 0;

    gsap.set(element, { scale: fromScale, transformOrigin: 'center center' });
    
    return new Promise((resolve) => {
      gsap.to(element, {
        scale: toScale,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: this.convertEasing(easing),
        onComplete: resolve,
      });
    });
  }

  private async playRotateAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, easing, properties } = animation;
    const rotation = properties.rotationZ || 360;
    
    gsap.set(element, { rotation: 0, transformOrigin: properties.transformOrigin || 'center center' });
    
    return new Promise((resolve) => {
      gsap.to(element, {
        rotation,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: this.convertEasing(easing),
        onComplete: resolve,
      });
    });
  }

  private async play3DAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, easing, properties } = animation;
    
    const rotationX = properties.rotationX || 0;
    const rotationY = properties.rotationY || 0;
    const rotationZ = properties.rotationZ || 0;
    const perspective = properties.perspective || 1000;
    const z = properties.z || 0;

    gsap.set(element, {
      transformPerspective: perspective,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      z: 0,
    });
    
    return new Promise((resolve) => {
      gsap.to(element, {
        rotationX,
        rotationY,
        rotationZ,
        z,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: this.convertEasing(easing),
        onComplete: resolve,
      });
    });
  }

  private async playParticleAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, properties } = animation;
    
    const config: ParticleConfig = {
      count: properties.particleCount || 50,
      size: properties.particleSize || 5,
      color: properties.particleColor || '#ffffff',
      velocity: properties.particleVelocity || { x: 0, y: -2 },
      gravity: 0.5,
      life: duration / 1000,
      shape: 'circle',
    };

    const particleSystem = new ParticleSystem(element, config);
    this.particleSystems.set(animation.id, particleSystem);

    await new Promise((resolve) => setTimeout(resolve, delay));
    await particleSystem.start();
    
    this.particleSystems.delete(animation.id);
  }

  private async playMorphAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, easing, properties } = animation;
    
    if (!properties.morphPath) {
      console.warn('Morph animation requires morphPath property');
      return;
    }

    const svgElement = element.querySelector('svg path');
    if (!svgElement) {
      console.warn('Morph animation requires an SVG path element');
      return;
    }

    return new Promise((resolve) => {
      gsap.to(svgElement, {
        attr: { d: properties.morphPath },
        duration: duration / 1000,
        delay: delay / 1000,
        ease: this.convertEasing(easing),
        onComplete: resolve,
      });
    });
  }

  private async playCustomAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { duration, delay, easing, properties, keyframes } = animation;

    if (keyframes && keyframes.length > 0) {
      return this.playKeyframeAnimation(animation, element);
    }

    const animProps: any = {};
    Object.keys(properties).forEach(key => {
      if (key !== 'from' && key !== 'to' && key !== 'direction' && key !== 'intensity') {
        animProps[key] = properties[key as keyof typeof properties];
      }
    });

    return new Promise((resolve) => {
      gsap.to(element, {
        ...animProps,
        duration: duration / 1000,
        delay: delay / 1000,
        ease: this.convertEasing(easing),
        onComplete: resolve,
      });
    });
  }

  private async playKeyframeAnimation(animation: Animation, element: HTMLElement): Promise<void> {
    const { keyframes, easing } = animation;

    if (!keyframes || keyframes.length === 0) {
      return;
    }

    const timeline = gsap.timeline();
    
    keyframes.forEach((keyframe, index) => {
      const prevTime = index > 0 ? keyframes[index - 1].time : 0;
      const duration = (keyframe.time - prevTime) / 1000;
      
      timeline.to(element, {
        ...keyframe.properties,
        duration,
        ease: this.convertEasing(keyframe.easing || easing),
      }, prevTime / 1000);
    });

    return new Promise((resolve) => {
      timeline.eventCallback('onComplete', resolve);
    });
  }

  createTimeline(slideId: string, animations: Animation[]): gsap.core.Timeline {
    const timeline = gsap.timeline({ paused: true });
    this.timelines.set(slideId, timeline);
    
    animations.forEach(animation => {
      const element = document.querySelector(`[data-element-id="${animation.elementId}"]`) as HTMLElement;
      if (element) {
        timeline.add(() => this.playAnimation(animation, element), animation.delay / 1000);
      }
    });

    return timeline;
  }

  playTimeline(slideId: string): void {
    const timeline = this.timelines.get(slideId);
    if (timeline) {
      timeline.play();
    }
  }

  pauseTimeline(slideId: string): void {
    const timeline = this.timelines.get(slideId);
    if (timeline) {
      timeline.pause();
    }
  }

  seekTimeline(slideId: string, time: number): void {
    const timeline = this.timelines.get(slideId);
    if (timeline) {
      timeline.seek(time / 1000);
    }
  }

  stopTimeline(slideId: string): void {
    const timeline = this.timelines.get(slideId);
    if (timeline) {
      timeline.pause(0);
    }
  }

  destroyTimeline(slideId: string): void {
    const timeline = this.timelines.get(slideId);
    if (timeline) {
      timeline.kill();
      this.timelines.delete(slideId);
    }
  }

  stopAllAnimations(): void {
    this.activeAnimations.forEach(id => {
      gsap.killTweensOf(`[data-animation-id="${id}"]`);
    });
    this.activeAnimations.clear();
    
    this.particleSystems.forEach(system => system.stop());
    this.particleSystems.clear();
  }

  private convertEasing(easing: EasingType): string {
    const easingMap: Record<string, string> = {
      'linear': 'none',
      'ease': 'power1.inOut',
      'ease-in': 'power1.in',
      'ease-out': 'power1.out',
      'ease-in-out': 'power1.inOut',
    };

    return easingMap[easing] || easing;
  }

  init3DRenderer(container: HTMLElement): void {
    this.threeScene = new THREE.Scene();
    this.threeCamera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.threeRenderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.threeRenderer.domElement);
    
    this.threeCamera.position.z = 5;
  }

  dispose3DRenderer(): void {
    if (this.threeRenderer) {
      this.threeRenderer.dispose();
      this.threeRenderer = undefined;
    }
    this.threeScene = undefined;
    this.threeCamera = undefined;
  }
}

class ParticleSystem {
  private container: HTMLElement;
  private config: ParticleConfig;
  private particles: HTMLElement[] = [];
  private animationFrameId?: number;

  constructor(container: HTMLElement, config: ParticleConfig) {
    this.container = container;
    this.config = config;
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.createParticles();
      this.animate();
      setTimeout(() => {
        this.stop();
        resolve();
      }, this.config.life * 1000);
    });
  }

  private createParticles(): void {
    const rect = this.container.getBoundingClientRect();
    
    for (let i = 0; i < this.config.count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = `${this.config.size}px`;
      particle.style.height = `${this.config.size}px`;
      particle.style.backgroundColor = this.config.color;
      particle.style.borderRadius = this.config.shape === 'circle' ? '50%' : '0';
      particle.style.pointerEvents = 'none';
      
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      const vx = this.config.velocity.x + (Math.random() - 0.5) * 2;
      const vy = this.config.velocity.y + (Math.random() - 0.5) * 2;
      (particle as any).__velocity = { x: vx, y: vy };
      
      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }

  private animate = (): void => {
    this.particles.forEach(particle => {
      const velocity = (particle as any).__velocity;
      const currentX = parseFloat(particle.style.left);
      const currentY = parseFloat(particle.style.top);
      
      velocity.y += this.config.gravity;
      
      particle.style.left = `${currentX + velocity.x}px`;
      particle.style.top = `${currentY + velocity.y}px`;
      
      const opacity = parseFloat(particle.style.opacity || '1');
      particle.style.opacity = `${Math.max(0, opacity - 0.01)}`;
    });

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    this.particles.forEach(particle => particle.remove());
    this.particles = [];
  }
}

export const animationEngine = new AnimationEngine();
