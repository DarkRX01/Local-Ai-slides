import { usePresentationStore } from '@/stores/usePresentationStore';
import { SlideCanvas } from './SlideCanvas';
import { EditorToolbar } from './EditorToolbar';
import { LayerManager } from './LayerManager';

export function SlideEditor() {
  const { currentPresentation, currentSlideId } = usePresentationStore();
  const currentSlide = currentPresentation?.slides.find((s) => s.id === currentSlideId);

  if (!currentSlide) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
        Select a slide to start editing
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative bg-gray-100 dark:bg-gray-800">
          <SlideCanvas slide={currentSlide} />
        </div>
        <LayerManager slide={currentSlide} />
      </div>
    </div>
  );
}
