import { Slide } from '@shared/types';
import { cn } from '@/lib/utils';

interface SlideThumbnailProps {
  slide: Slide;
  isActive: boolean;
  onClick: () => void;
}

export function SlideThumbnail({ slide, isActive, onClick }: SlideThumbnailProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative aspect-video cursor-pointer rounded-lg border-2 transition-all',
        'hover:border-primary',
        isActive
          ? 'border-primary shadow-lg'
          : 'border-gray-300 dark:border-gray-700'
      )}
    >
      <div
        className="h-full w-full rounded-md"
        style={{
          background:
            slide.background.type === 'color'
              ? slide.background.value
              : slide.background.type === 'gradient'
              ? slide.background.value
              : `url(${slide.background.value})`,
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute bottom-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
          {slide.order + 1}
        </div>
      </div>
    </div>
  );
}
