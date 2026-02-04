import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { api } from '@/services/api';
import { usePresentationStore } from '@/stores/usePresentationStore';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportStarted?: (jobId: string) => void;
}

type ExportFormat = 'pdf' | 'pptx' | 'html' | 'video';
type ExportQuality = 'low' | 'medium' | 'high';

export function ExportDialog({ open, onOpenChange, onExportStarted }: ExportDialogProps) {
  const { currentPresentation } = usePresentationStore();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [quality, setQuality] = useState<ExportQuality>('medium');
  const [includeNotes, setIncludeNotes] = useState(false);
  const [useSlideRange, setUseSlideRange] = useState(false);
  const [slideRangeStart, setSlideRangeStart] = useState(1);
  const [slideRangeEnd, setSlideRangeEnd] = useState(1);
  const [videoFps, setVideoFps] = useState(30);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSlides = currentPresentation?.slides.length || 0;

  const handleExport = async () => {
    if (!currentPresentation) {
      setError('No presentation selected');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const config = {
        format,
        options: {
          quality,
          includeNotes,
          ...(useSlideRange && {
            slideRange: [slideRangeStart - 1, slideRangeEnd - 1] as [number, number],
          }),
          ...(format === 'video' && { videoFps }),
        },
      };

      const job = await api.exportPresentation(currentPresentation.id, config);

      if (onExportStarted) {
        onExportStarted(job.id);
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'pptx', label: 'PowerPoint (PPTX)' },
    { value: 'html', label: 'HTML Presentation' },
    { value: 'video', label: 'Video (MP4)' },
  ];

  const qualityOptions = [
    { value: 'low', label: 'Low (Fast)' },
    { value: 'medium', label: 'Medium (Balanced)' },
    { value: 'high', label: 'High (Best Quality)' },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Export Presentation"
      description="Choose export format and options"
      size="medium"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !currentPresentation}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Export Format</label>
          <Select
            value={format}
            onChange={(value) => setFormat(value as ExportFormat)}
            options={formatOptions}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Quality</label>
          <Select
            value={quality}
            onChange={(value) => setQuality(value as ExportQuality)}
            options={qualityOptions}
          />
          <p className="text-xs text-foreground/60 mt-1">
            Higher quality results in larger file sizes and longer export times
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeNotes"
            checked={includeNotes}
            onChange={(e) => setIncludeNotes(e.target.checked)}
            className="w-4 h-4 rounded border-foreground/20"
          />
          <label htmlFor="includeNotes" className="text-sm cursor-pointer">
            Include slide notes
          </label>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="useSlideRange"
              checked={useSlideRange}
              onChange={(e) => {
                setUseSlideRange(e.target.checked);
                if (e.target.checked) {
                  setSlideRangeEnd(totalSlides);
                }
              }}
              className="w-4 h-4 rounded border-foreground/20"
            />
            <label htmlFor="useSlideRange" className="text-sm cursor-pointer">
              Export specific slide range
            </label>
          </div>

          {useSlideRange && (
            <div className="flex items-center gap-3 ml-6">
              <div className="flex-1">
                <label className="block text-xs text-foreground/60 mb-1">From</label>
                <Input
                  type="number"
                  min={1}
                  max={totalSlides}
                  value={slideRangeStart}
                  onChange={(e) => setSlideRangeStart(Math.max(1, Math.min(totalSlides, parseInt(e.target.value) || 1)))}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-foreground/60 mb-1">To</label>
                <Input
                  type="number"
                  min={slideRangeStart}
                  max={totalSlides}
                  value={slideRangeEnd}
                  onChange={(e) => setSlideRangeEnd(Math.max(slideRangeStart, Math.min(totalSlides, parseInt(e.target.value) || totalSlides)))}
                />
              </div>
            </div>
          )}
        </div>

        {format === 'video' && (
          <div>
            <label className="block text-sm font-medium mb-2">Frame Rate (FPS)</label>
            <Input
              type="number"
              min={10}
              max={60}
              value={videoFps}
              onChange={(e) => setVideoFps(Math.max(10, Math.min(60, parseInt(e.target.value) || 30)))}
            />
            <p className="text-xs text-foreground/60 mt-1">
              Higher frame rates create smoother videos but larger file sizes
            </p>
          </div>
        )}

        <div className="bg-foreground/5 p-3 rounded text-sm">
          <p className="font-medium mb-1">Export Summary</p>
          <ul className="text-foreground/70 space-y-1">
            <li>Format: {formatOptions.find(o => o.value === format)?.label}</li>
            <li>Quality: {qualityOptions.find(o => o.value === quality)?.label}</li>
            <li>
              Slides: {useSlideRange ? `${slideRangeStart} to ${slideRangeEnd}` : `All (${totalSlides})`}
            </li>
            {format === 'video' && <li>Frame Rate: {videoFps} FPS</li>}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
