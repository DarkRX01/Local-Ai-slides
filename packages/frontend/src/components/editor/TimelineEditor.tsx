import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Animation } from '@slides-clone/shared';
import { useAnimationStore } from '@/store/animationStore';
import { Play, Pause, Square, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TimelineEditorProps {
  slideId: string;
  animations: Animation[];
  duration: number;
  onAnimationSelect?: (animationId: string) => void;
  onTimeChange?: (time: number) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  slideId,
  animations,
  duration,
  onAnimationSelect,
  onTimeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAnimationId, setSelectedAnimationId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const animationFrameRef = useRef<number>();

  const { setCurrentTime: setStoreTime, setSelectedAnimation } = useAnimationStore();

  const TIMELINE_HEIGHT = 200;
  const TRACK_HEIGHT = 40;
  const HEADER_WIDTH = 120;
  const SCALE = 100;

  useEffect(() => {
    drawTimeline();
  }, [animations, currentTime, selectedAnimationId, duration]);

  useEffect(() => {
    if (isPlaying) {
      let lastTimestamp = performance.now();
      
      const animate = (timestamp: number) => {
        const delta = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        setCurrentTime(prev => {
          const newTime = prev + delta;
          if (newTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return newTime;
        });

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isPlaying, duration]);

  useEffect(() => {
    setStoreTime(currentTime);
    onTimeChange?.(currentTime);
  }, [currentTime, setStoreTime, onTimeChange]);

  const drawTimeline = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, HEADER_WIDTH, height);

    const timelineWidth = width - HEADER_WIDTH;
    const pixelsPerMs = timelineWidth / duration;

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    const timeStep = 1000;
    for (let t = 0; t <= duration; t += timeStep) {
      const x = HEADER_WIDTH + t * pixelsPerMs;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      ctx.fillStyle = '#888';
      ctx.font = '10px monospace';
      ctx.fillText(`${(t / 1000).toFixed(1)}s`, x + 4, 12);
    }

    const groupedAnimations = animations.reduce((acc, anim) => {
      const key = anim.elementId || 'global';
      if (!acc[key]) acc[key] = [];
      acc[key].push(anim);
      return acc;
    }, {} as Record<string, Animation[]>);

    const tracks = Object.keys(groupedAnimations);
    const trackHeight = Math.min(TRACK_HEIGHT, (height - 40) / Math.max(tracks.length, 1));

    tracks.forEach((trackKey, trackIndex) => {
      const y = 40 + trackIndex * trackHeight;

      ctx.fillStyle = '#333';
      ctx.fillRect(0, y, HEADER_WIDTH, trackHeight);
      
      ctx.fillStyle = '#fff';
      ctx.font = '12px sans-serif';
      ctx.fillText(trackKey.substring(0, 15), 8, y + trackHeight / 2 + 4);

      ctx.strokeStyle = '#555';
      ctx.beginPath();
      ctx.moveTo(0, y + trackHeight);
      ctx.lineTo(width, y + trackHeight);
      ctx.stroke();

      groupedAnimations[trackKey].forEach(anim => {
        const startX = HEADER_WIDTH + anim.delay * pixelsPerMs;
        const animWidth = anim.duration * pixelsPerMs;
        
        const isSelected = anim.id === selectedAnimationId;
        
        ctx.fillStyle = isSelected ? '#4a90e2' : getAnimationColor(anim.type);
        ctx.fillRect(startX, y + 4, animWidth, trackHeight - 8);

        ctx.strokeStyle = isSelected ? '#ffffff' : '#000';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.strokeRect(startX, y + 4, animWidth, trackHeight - 8);

        if (animWidth > 40) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px sans-serif';
          ctx.fillText(anim.type, startX + 4, y + trackHeight / 2 + 4);
        }
      });
    });

    const playheadX = HEADER_WIDTH + currentTime * pixelsPerMs;
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();

    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.moveTo(playheadX - 6, 0);
    ctx.lineTo(playheadX + 6, 0);
    ctx.lineTo(playheadX, 10);
    ctx.closePath();
    ctx.fill();
  }, [animations, currentTime, selectedAnimationId, duration]);

  const getAnimationColor = (type: string): string => {
    const colors: Record<string, string> = {
      fade: '#6b7280',
      slide: '#3b82f6',
      zoom: '#8b5cf6',
      rotate: '#ec4899',
      '3d': '#f59e0b',
      particle: '#10b981',
      morph: '#14b8a6',
      custom: '#6366f1',
    };
    return colors[type] || '#6b7280';
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (x < HEADER_WIDTH) {
      return;
    }

    const timelineWidth = canvas.width - HEADER_WIDTH;
    const pixelsPerMs = timelineWidth / duration;
    const clickedTime = (x - HEADER_WIDTH) / pixelsPerMs;

    const groupedAnimations = animations.reduce((acc, anim) => {
      const key = anim.elementId || 'global';
      if (!acc[key]) acc[key] = [];
      acc[key].push(anim);
      return acc;
    }, {} as Record<string, Animation[]>);

    const tracks = Object.keys(groupedAnimations);
    const trackHeight = Math.min(TRACK_HEIGHT, (canvas.height - 40) / Math.max(tracks.length, 1));
    const trackIndex = Math.floor((y - 40) / trackHeight);

    if (trackIndex >= 0 && trackIndex < tracks.length) {
      const trackKey = tracks[trackIndex];
      const trackAnimations = groupedAnimations[trackKey];

      const clickedAnimation = trackAnimations.find(anim => {
        const startTime = anim.delay;
        const endTime = anim.delay + anim.duration;
        return clickedTime >= startTime && clickedTime <= endTime;
      });

      if (clickedAnimation) {
        setSelectedAnimationId(clickedAnimation.id);
        setSelectedAnimation(clickedAnimation.id);
        onAnimationSelect?.(clickedAnimation.id);
      } else {
        setCurrentTime(clickedTime);
      }
    } else {
      setCurrentTime(clickedTime);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x >= HEADER_WIDTH) {
      setIsDragging(true);
      setDragStartX(x);
      setDragStartTime(currentTime);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    const timelineWidth = canvas.width - HEADER_WIDTH;
    const pixelsPerMs = timelineWidth / duration;
    const deltaX = x - dragStartX;
    const deltaTime = deltaX / pixelsPerMs;
    
    const newTime = Math.max(0, Math.min(duration, dragStartTime + deltaTime));
    setCurrentTime(newTime);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleStepBackward = () => {
    setCurrentTime(Math.max(0, currentTime - 100));
  };

  const handleStepForward = () => {
    setCurrentTime(Math.min(duration, currentTime + 100));
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = TIMELINE_HEIGHT;
        drawTimeline();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawTimeline]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center gap-2 p-2 bg-gray-800 border-b border-gray-700">
        <Button size="sm" onClick={handleStepBackward} variant="ghost">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={handlePlay} variant="ghost">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button size="sm" onClick={handleStop} variant="ghost">
          <Square className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={handleStepForward} variant="ghost">
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="ml-4 text-sm text-gray-300">
          {(currentTime / 1000).toFixed(2)}s / {(duration / 1000).toFixed(2)}s
        </div>
      </div>
      <div ref={containerRef} className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>
    </div>
  );
};
