import React, { useEffect, useState, useCallback } from 'react';
import { usePresentationStore } from '@/store/presentationStore';
import { useVoiceStore } from '@/store/voiceStore';
import type { Slide } from '@slides-clone/shared';

export const PresentationMode: React.FC = () => {
  const { currentPresentation } = usePresentationStore();
  const { getVoiceOver, playVoiceOver, stopSpeaking, isSpeaking, settings } = useVoiceStore();
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [autoPlayVoiceOver, setAutoPlayVoiceOver] = useState(true);

  const currentSlide = currentPresentation?.slides[currentSlideIndex];

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        previousSlide();
      } else if (e.key === 'Escape') {
        exitPresentation();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlideIndex]);

  useEffect(() => {
    if (currentSlide && autoPlayVoiceOver && settings.enabled) {
      playSlideVoiceOver();
    }
  }, [currentSlide?.id]);

  const playSlideVoiceOver = async () => {
    if (!currentSlide) return;

    try {
      const voiceOver = await getVoiceOver(currentSlide.id);
      if (voiceOver) {
        await playVoiceOver(currentSlide.id);
      }
    } catch (error) {
      console.error('Failed to play voice-over:', error);
    }
  };

  const nextSlide = useCallback(() => {
    if (!currentPresentation) return;
    
    stopSpeaking();
    
    if (currentSlideIndex < currentPresentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, currentPresentation, stopSpeaking]);

  const previousSlide = useCallback(() => {
    stopSpeaking();
    
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, stopSpeaking]);

  const exitPresentation = () => {
    stopSpeaking();
    window.history.back();
  };

  if (!currentPresentation || !currentSlide) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div>No presentation loaded</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-7xl w-full aspect-video bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="h-full p-12 flex flex-col justify-center">
              {currentSlide.elements?.map((element: any) => (
                <div key={element.id} style={{
                  position: 'absolute',
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  width: `${element.size.width}px`,
                  height: `${element.size.height}px`,
                  transform: `rotate(${element.rotation}deg)`,
                  zIndex: element.zIndex,
                }}>
                  {element.type === 'text' && (
                    <div style={{
                      fontFamily: element.style?.fontFamily,
                      fontSize: `${element.style?.fontSize}px`,
                      fontWeight: element.style?.fontWeight,
                      color: element.style?.color,
                      textAlign: element.style?.textAlign,
                    }}>
                      {element.content?.text}
                    </div>
                  )}
                  {element.type === 'image' && element.content?.src && (
                    <img src={element.content.src} alt="" className="w-full h-full object-contain" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-8 py-4 bg-gray-900 bg-opacity-80">
          <div className="flex items-center gap-4">
            <button
              onClick={previousSlide}
              disabled={currentSlideIndex === 0}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            <span className="text-white text-sm">
              {currentSlideIndex + 1} / {currentPresentation.slides.length}
            </span>

            <button
              onClick={nextSlide}
              disabled={currentSlideIndex === currentPresentation.slides.length - 1}
              className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {settings.enabled && (
              <>
                <button
                  onClick={() => setAutoPlayVoiceOver(!autoPlayVoiceOver)}
                  className="flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  {autoPlayVoiceOver ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3zm5 7a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7 7 0 0013.93 1H15a1 1 0 100-2h-.07A7.002 7.002 0 0015 10z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                  )}
                  Auto-play Voice
                </button>

                {isSpeaking && (
                  <div className="flex items-center gap-2 text-white text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Playing voice-over
                  </div>
                )}
              </>
            )}

            <button
              onClick={exitPresentation}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Exit (ESC)
            </button>
          </div>
        </div>
      </div>

      {currentSlide.notes && (
        <div className="fixed bottom-20 left-8 max-w-md bg-gray-800 bg-opacity-90 text-white p-4 rounded-lg">
          <div className="text-xs font-semibold mb-1">Speaker Notes:</div>
          <div className="text-sm">{currentSlide.notes}</div>
        </div>
      )}
    </div>
  );
};
