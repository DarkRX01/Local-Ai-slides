import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Animation } from '@slides-clone/shared';

interface Animation3DSceneProps {
  animation: Animation;
  elementContent?: string;
  onComplete?: () => void;
}

export const Animation3DScene: React.FC<Animation3DSceneProps> = ({
  animation,
  elementContent,
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const meshRef = useRef<THREE.Mesh>();
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4a90e2,
      specular: 0x555555,
      shininess: 30,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animation.duration, 1);

      if (meshRef.current && animation.properties) {
        const rotationX = animation.properties.rotationX || 0;
        const rotationY = animation.properties.rotationY || 0;
        const rotationZ = animation.properties.rotationZ || 0;
        const scale = animation.properties.scale || 1;

        meshRef.current.rotation.x = (rotationX * Math.PI / 180) * progress;
        meshRef.current.rotation.y = (rotationY * Math.PI / 180) * progress;
        meshRef.current.rotation.z = (rotationZ * Math.PI / 180) * progress;
        meshRef.current.scale.setScalar(scale * progress + (1 - progress));
      }

      renderer.render(scene, camera);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (renderer) {
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }

      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(mat => mat.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
    };
  }, [animation, onComplete]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};

export const create3DSlideTransition = (
  fromSlide: HTMLElement,
  toSlide: HTMLElement,
  transitionType: 'cube' | 'flip' | 'rotate' | 'zoom'
): Promise<void> => {
  return new Promise((resolve) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const fromTexture = createTextureFromElement(fromSlide);
    const toTexture = createTextureFromElement(toSlide);

    const geometry = new THREE.PlaneGeometry(10, 7.5);
    const material = new THREE.MeshBasicMaterial({ map: fromTexture });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    camera.position.z = 10;

    let startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      switch (transitionType) {
        case 'cube':
          plane.rotation.y = progress * Math.PI;
          if (progress > 0.5 && material.map === fromTexture) {
            material.map = toTexture;
            material.needsUpdate = true;
          }
          break;
        case 'flip':
          plane.rotation.x = progress * Math.PI;
          if (progress > 0.5 && material.map === fromTexture) {
            material.map = toTexture;
            material.needsUpdate = true;
          }
          break;
        case 'rotate':
          plane.rotation.z = progress * Math.PI * 2;
          plane.scale.setScalar(1 - progress * 0.5);
          if (progress > 0.5 && material.map === fromTexture) {
            material.map = toTexture;
            material.needsUpdate = true;
            plane.scale.setScalar((1 - progress) * 0.5);
          }
          break;
        case 'zoom':
          const scale = progress < 0.5 ? 1 - progress : progress;
          plane.scale.setScalar(scale);
          if (progress > 0.5 && material.map === fromTexture) {
            material.map = toTexture;
            material.needsUpdate = true;
          }
          break;
      }

      renderer.render(scene, camera);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        renderer.dispose();
        document.body.removeChild(renderer.domElement);
        fromTexture.dispose();
        toTexture.dispose();
        resolve();
      }
    };

    animate();
  });
};

const createTextureFromElement = (element: HTMLElement): THREE.Texture => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.Texture();
  }

  canvas.width = element.offsetWidth;
  canvas.height = element.offsetHeight;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const data = new XMLSerializer().serializeToString(element);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${data}</div>
      </foreignObject>
    </svg>
  `;

  const img = new Image();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const texture = new THREE.Texture();
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    texture.image = canvas;
    texture.needsUpdate = true;
    URL.revokeObjectURL(url);
  };
  
  img.src = url;

  return texture;
};
