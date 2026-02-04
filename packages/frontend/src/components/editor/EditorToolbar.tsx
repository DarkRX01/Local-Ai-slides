import { 
  Type, 
  Image, 
  Square, 
  Circle, 
  Undo2, 
  Redo2, 
  Copy, 
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { generateId } from '@/lib/utils';
import { SlideElement } from '@shared/types';
import { ImageLibrary } from '@/components/images';

export function EditorToolbar() {
  const { currentPresentation, currentSlideId, updateSlide } = usePresentationStore();
  const { selectedElementIds, clipboard, copyElements, clearSelection, undo, redo } = useEditorStore();
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);
  
  const currentSlide = currentPresentation?.slides.find((s) => s.id === currentSlideId);

  const addElement = (type: 'text' | 'image' | 'shape', properties: any) => {
    if (!currentSlide) return;

    const newElement: SlideElement = {
      id: generateId(),
      type,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      rotation: 0,
      zIndex: currentSlide.elements.length,
      properties,
    };

    updateSlide(currentSlide.id, {
      elements: [...currentSlide.elements, newElement],
    });
  };

  const handleAddText = () => {
    addElement('text', {
      content: 'New Text',
      fontSize: 32,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#000000',
      align: 'left',
      lineHeight: 1.2,
    });
  };

  const handleAddRectangle = () => {
    addElement('shape', {
      type: 'rectangle',
      fill: '#3b82f6',
      stroke: '#000000',
      strokeWidth: 2,
    });
  };

  const handleAddCircle = () => {
    addElement('shape', {
      type: 'circle',
      fill: '#8b5cf6',
      stroke: '#000000',
      strokeWidth: 2,
    });
  };

  const handleAddImage = (imageUrl: string) => {
    addElement('image', {
      src: imageUrl,
      fit: 'contain',
      opacity: 1,
    });
    setIsImageLibraryOpen(false);
  };

  const handleCopy = () => {
    if (!currentSlide || selectedElementIds.length === 0) return;
    const selectedElements = currentSlide.elements.filter((el) =>
      selectedElementIds.includes(el.id)
    );
    copyElements(selectedElements);
  };



  const handleDelete = () => {
    if (!currentSlide || selectedElementIds.length === 0) return;
    
    const remainingElements = currentSlide.elements.filter(
      (el) => !selectedElementIds.includes(el.id)
    );

    updateSlide(currentSlide.id, { elements: remainingElements });
    clearSelection();
  };

  return (
    <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-800">
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 dark:border-gray-700">
        <Button variant="ghost" size="sm" onClick={undo} title="Undo">
          <Undo2 size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} title="Redo">
          <Redo2 size={18} />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 dark:border-gray-700">
        <Button variant="ghost" size="sm" onClick={handleAddText} title="Add Text">
          <Type size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setIsImageLibraryOpen(true)} title="Add Image">
          <Image size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleAddRectangle} title="Add Rectangle">
          <Square size={18} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleAddCircle} title="Add Circle">
          <Circle size={18} />
        </Button>
      </div>

      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 dark:border-gray-700">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy} 
          disabled={selectedElementIds.length === 0}
          title="Copy"
        >
          <Copy size={18} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDelete} 
          disabled={selectedElementIds.length === 0}
          title="Delete"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" title="Align Left">
          <AlignLeft size={18} />
        </Button>
        <Button variant="ghost" size="sm" title="Align Center">
          <AlignCenter size={18} />
        </Button>
        <Button variant="ghost" size="sm" title="Align Right">
          <AlignRight size={18} />
        </Button>
      </div>

      <ImageLibrary
        isOpen={isImageLibraryOpen}
        onClose={() => setIsImageLibraryOpen(false)}
        onImageSelect={handleAddImage}
      />
    </div>
  );
}
