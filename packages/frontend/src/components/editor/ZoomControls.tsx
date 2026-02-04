import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEditorStore } from '@/stores/useEditorStore';

export function ZoomControls() {
  const { zoom, setZoom } = useEditorStore();

  const handleZoomIn = () => setZoom(zoom + 0.1);
  const handleZoomOut = () => setZoom(zoom - 0.1);
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800">
      <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.1}>
        <ZoomOut size={18} />
      </Button>
      <button
        onClick={handleResetZoom}
        className="min-w-[60px] text-sm font-medium text-gray-900 dark:text-white"
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 5}>
        <ZoomIn size={18} />
      </Button>
    </div>
  );
}
