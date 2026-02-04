import { Plus } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { SlideThumbnail } from '@/components/editor/SlideThumbnail';
import { usePresentationStore } from '@/stores/usePresentationStore';

export function VirtualizedSidebar() {
  const { currentPresentation, currentSlideId, setCurrentSlideId, addSlide } =
    usePresentationStore();
  
  const parentRef = useRef<HTMLDivElement>(null);

  const handleAddSlide = () => {
    if (!currentPresentation) return;
    
    const newSlide = {
      id: `slide-${Date.now()}`,
      presentationId: currentPresentation.id,
      order: currentPresentation.slides.length,
      background: { type: 'color' as const, value: '#ffffff' },
      elements: [],
      animations: [],
    };
    
    addSlide(newSlide);
    setCurrentSlideId(newSlide.id);
  };

  const slides = currentPresentation?.slides || [];

  const virtualizer = useVirtualizer({
    count: slides.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">Slides</h2>
        <Button variant="ghost" size="sm" onClick={handleAddSlide}>
          <Plus size={18} />
        </Button>
      </div>

      <div 
        ref={parentRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ contain: 'strict' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const slide = slides[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                  paddingBottom: '8px',
                }}
              >
                <SlideThumbnail
                  slide={slide}
                  isActive={slide.id === currentSlideId}
                  onClick={() => setCurrentSlideId(slide.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
