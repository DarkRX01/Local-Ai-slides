import React, { useRef, useEffect, useState } from 'react';
import { Animation } from '@slides-clone/shared';
import { animationEngine } from '@/services/animationEngine';
import { Button } from '@/components/ui/Button';
import { Play, RotateCcw, X } from 'lucide-react';

interface AnimationPreviewProps {
  animation: Animation;
  onClose: () => void;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  animation,
  onClose,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (elementRef.current && isPlaying) {
      playPreview();
    }
  }, [isPlaying, animation]);

  const playPreview = async () => {
    if (!elementRef.current) return;

    const element = elementRef.current.querySelector('.preview-element') as HTMLElement;
    if (!element) return;

    resetElement(element);

    try {
      await animationEngine.playAnimation(animation, element);
    } catch (error) {
      console.error('Animation preview error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const resetElement = (element: HTMLElement) => {
    element.style.opacity = '1';
    element.style.transform = 'none';
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleReplay = () => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 100);
  };

  const getPreviewContent = () => {
    switch (animation.type) {
      case 'particle':
        return (
          <div className="preview-element w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg relative">
            Preview
          </div>
        );
      case '3d':
        return (
          <div className="preview-element w-48 h-48 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-2xl" style={{ transformStyle: 'preserve-3d' }}>
            3D
          </div>
        );
      default:
        return (
          <div className="preview-element w-40 h-40 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            Element
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">Animation Preview</h3>
            <p className="text-sm text-gray-400">{animation.type} • {animation.duration}ms</p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div
          ref={elementRef}
          className="p-12 flex items-center justify-center min-h-[400px] bg-gray-800"
          style={{ perspective: '1000px' }}
        >
          {getPreviewContent()}
        </div>

        <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-700">
          <Button onClick={handlePlay} disabled={isPlaying}>
            <Play className="w-4 h-4 mr-2" />
            {isPlaying ? 'Playing...' : 'Play'}
          </Button>
          <Button variant="outline" onClick={handleReplay}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Replay
          </Button>
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-850">
          <h4 className="text-sm font-semibold text-white mb-2">Animation Details</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Type:</span>
              <span className="ml-2 text-white">{animation.type}</span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="ml-2 text-white">{animation.duration}ms</span>
            </div>
            <div>
              <span className="text-gray-400">Delay:</span>
              <span className="ml-2 text-white">{animation.delay}ms</span>
            </div>
            <div>
              <span className="text-gray-400">Easing:</span>
              <span className="ml-2 text-white">{animation.easing}</span>
            </div>
            <div>
              <span className="text-gray-400">Trigger:</span>
              <span className="ml-2 text-white">{animation.trigger}</span>
            </div>
            {animation.repeat && (
              <div>
                <span className="text-gray-400">Repeat:</span>
                <span className="ml-2 text-white">{animation.repeat}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AnimationPreviewPanel: React.FC<{
  animations: Animation[];
  slideId: string;
}> = ({ animations, slideId }) => {
  const [previewMode, setPreviewMode] = useState<'sequence' | 'individual'>('sequence');
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const playAllAnimations = async () => {
    if (!containerRef.current) return;

    setIsPlaying(true);

    try {
      if (previewMode === 'sequence') {
        for (const animation of animations) {
          const element = containerRef.current.querySelector(
            `[data-element-id="${animation.elementId}"]`
          ) as HTMLElement;
          if (element) {
            await animationEngine.playAnimation(animation, element);
          }
        }
      } else {
        const promises = animations.map(animation => {
          const element = containerRef.current?.querySelector(
            `[data-element-id="${animation.elementId}"]`
          ) as HTMLElement;
          if (element) {
            return animationEngine.playAnimation(animation, element);
          }
          return Promise.resolve();
        });
        await Promise.all(promises);
      }
    } catch (error) {
      console.error('Preview error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Preview Mode</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={previewMode === 'sequence' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('sequence')}
            >
              Sequence
            </Button>
            <Button
              size="sm"
              variant={previewMode === 'individual' ? 'default' : 'outline'}
              onClick={() => setPreviewMode('individual')}
            >
              Simultaneous
            </Button>
          </div>
        </div>

        <Button onClick={playAllAnimations} disabled={isPlaying} className="w-full">
          <Play className="w-4 h-4 mr-2" />
          {isPlaying ? 'Playing...' : 'Preview All Animations'}
        </Button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-8 bg-gray-800"
        style={{ perspective: '1000px' }}
      >
        <div className="relative min-h-full">
          {animations.map(animation => (
            <div
              key={animation.id}
              data-element-id={animation.elementId}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
            >
              Element
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-850">
        <div className="text-sm text-gray-400">
          {animations.length} animation{animations.length !== 1 ? 's' : ''} ready to preview
        </div>
      </div>
    </div>
  );
};
