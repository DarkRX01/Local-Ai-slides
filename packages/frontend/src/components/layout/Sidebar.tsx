import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SlideThumbnail } from '@/components/editor/SlideThumbnail';
import { usePresentationStore } from '@/stores/usePresentationStore';

export function Sidebar() {
  const { currentPresentation, currentSlideId, setCurrentSlideId, addSlide } =
    usePresentationStore();

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

  return (
    <aside 
      className="flex w-64 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
      role="complementary"
      aria-label="Slides navigation"
    >
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">Slides</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleAddSlide}
          aria-label="Add new slide"
          title="Add new slide (Ctrl+N)"
        >
          <Plus size={18} aria-hidden="true" />
        </Button>
      </div>

      <nav 
        className="flex-1 overflow-y-auto p-4 space-y-2"
        aria-label="Slide thumbnails"
      >
        {currentPresentation?.slides.map((slide, index) => (
          <SlideThumbnail
            key={slide.id}
            slide={slide}
            isActive={slide.id === currentSlideId}
            onClick={() => setCurrentSlideId(slide.id)}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </nav>
    </aside>
  );
}
