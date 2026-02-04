import React, { useEffect, useState } from 'react';
import { Animation } from '@slides-clone/shared';
import { useAnimationStore } from '@/store/animationStore';
import { animationEngine } from '@/services/animationEngine';
import { Play, Pause, Square, SkipBack, SkipForward, Settings, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';

interface AnimationControlsProps {
  slideId: string;
  animations: Animation[];
  selectedElementId?: string;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  slideId,
  animations,
  selectedElementId,
}) => {
  const {
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    stop,
    setCurrentTime,
  } = useAnimationStore();

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const filteredAnimations = selectedElementId
    ? animations.filter(anim => anim.elementId === selectedElementId)
    : animations;

  useEffect(() => {
    if (filteredAnimations.length > 0) {
      animationEngine.createTimeline(slideId, filteredAnimations);
    }

    return () => {
      animationEngine.destroyTimeline(slideId);
    };
  }, [slideId, filteredAnimations]);

  const handlePlay = () => {
    if (isPlaying) {
      pause();
      animationEngine.pauseTimeline(slideId);
    } else {
      play();
      animationEngine.playTimeline(slideId);
    }
  };

  const handleStop = () => {
    stop();
    animationEngine.stopTimeline(slideId);
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    animationEngine.seekTimeline(slideId, newTime);
  };

  const handleSkipToStart = () => {
    setCurrentTime(0);
    animationEngine.seekTimeline(slideId, 0);
  };

  const handleSkipToEnd = () => {
    setCurrentTime(duration);
    animationEngine.seekTimeline(slideId, duration);
  };

  const handlePlaybackSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    return `${seconds}.${ms.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button size="sm" variant="ghost" onClick={handleSkipToStart}>
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={handlePlay}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleStop}>
            <Square className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSkipToEnd}>
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="flex-1 mx-4">
            <Slider
              value={[currentTime]}
              onValueChange={handleSeek}
              min={0}
              max={duration}
              step={10}
              className="w-full"
            />
          </div>

          <div className="text-sm text-gray-400 min-w-[120px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <Button
            size="sm"
            variant={loopEnabled ? 'default' : 'ghost'}
            onClick={() => setLoopEnabled(!loopEnabled)}
          >
            <Repeat className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant={showSettings ? 'default' : 'ghost'}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {showSettings && (
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Playback Speed: {playbackSpeed}x
                </label>
                <div className="flex items-center gap-2">
                  {[0.25, 0.5, 1, 1.5, 2].map(speed => (
                    <Button
                      key={speed}
                      size="sm"
                      variant={playbackSpeed === speed ? 'default' : 'outline'}
                      onClick={() => handlePlaybackSpeedChange(speed)}
                    >
                      {speed}x
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Animation Count: {filteredAnimations.length}
                </label>
                <div className="text-xs text-gray-500">
                  {selectedElementId
                    ? `Showing animations for selected element`
                    : `Showing all slide animations`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-500">Entrance</div>
                  <div className="text-white font-semibold">
                    {filteredAnimations.filter(a => ['fade', 'slide', 'zoom'].includes(a.type) && a.properties.direction === 'in').length}
                  </div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-500">Exit</div>
                  <div className="text-white font-semibold">
                    {filteredAnimations.filter(a => ['fade', 'slide', 'zoom'].includes(a.type) && a.properties.direction === 'out').length}
                  </div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-500">3D</div>
                  <div className="text-white font-semibold">
                    {filteredAnimations.filter(a => a.type === '3d').length}
                  </div>
                </div>
                <div className="bg-gray-800 p-2 rounded">
                  <div className="text-gray-500">Particle</div>
                  <div className="text-white font-semibold">
                    {filteredAnimations.filter(a => a.type === 'particle').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
