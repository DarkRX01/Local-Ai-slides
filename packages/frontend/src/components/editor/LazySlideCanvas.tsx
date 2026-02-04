import { useInView } from 'react-intersection-observer';
import { SlideCanvas } from './SlideCanvas';
import { Slide } from '@shared/types';

interface LazySlideCanvasProps {
  slide: Slide;
  isActive: boolean;
}

export function LazySlideCanvas({ slide, isActive }: LazySlideCanvasProps) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: '50px',
  });

  return (
    <div ref={ref} className="h-full w-full">
      {(inView || isActive) ? (
        <SlideCanvas slide={slide} />
      ) : (
        <div 
          className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
          style={{
            background: slide.background.type === 'color' 
              ? slide.background.value 
              : undefined,
          }}
        >
          <span className="text-sm text-gray-500">Loading slide...</span>
        </div>
      )}
    </div>
  );
}
