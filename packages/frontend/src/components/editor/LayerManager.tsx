import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, GripVertical } from 'lucide-react';
import { Slide, SlideElement } from '@shared/types';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { cn } from '@/lib/utils';

interface LayerManagerProps {
  slide: Slide;
}

export function LayerManager({ slide }: LayerManagerProps) {
  const { updateSlide } = usePresentationStore();
  const { selectedElementIds, setSelectedElements } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = slide.elements.findIndex((el) => el.id === active.id);
      const newIndex = slide.elements.findIndex((el) => el.id === over.id);

      const newElements = arrayMove(slide.elements, oldIndex, newIndex).map((el, index) => ({
        ...el,
        zIndex: index,
      }));

      updateSlide(slide.id, { elements: newElements });
    }
  };

  return (
    <div className="w-64 border-l border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-14 items-center border-b border-gray-200 px-4 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">Layers</h2>
      </div>

      <div className="p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slide.elements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
            {[...slide.elements].reverse().map((element) => (
              <LayerItem
                key={element.id}
                element={element}
                isSelected={selectedElementIds.includes(element.id)}
                onSelect={() => setSelectedElements([element.id])}
              />
            ))}
          </SortableContext>
        </DndContext>

        {slide.elements.length === 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
            No elements yet
          </p>
        )}
      </div>
    </div>
  );
}

interface LayerItemProps {
  element: SlideElement;
  isSelected: boolean;
  onSelect: () => void;
}

function LayerItem({ element, isSelected, onSelect }: LayerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: element.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getElementLabel = () => {
    if (element.type === 'text' && 'content' in element.properties) {
      const content = (element.properties as any).content;
      return content.length > 20 ? content.substring(0, 20) + '...' : content;
    }
    if (element.type === 'shape' && 'type' in element.properties) {
      return (element.properties as any).type;
    }
    return element.type;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        'flex items-center gap-2 rounded px-2 py-2 mb-1 cursor-pointer transition-colors',
        isSelected
          ? 'bg-primary/20 border border-primary'
          : 'hover:bg-gray-200 dark:hover:bg-gray-800 border border-transparent'
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <span className="flex-1 text-sm text-gray-900 dark:text-white capitalize">
        {getElementLabel()}
      </span>
      <Eye size={16} className="text-gray-400" />
    </div>
  );
}
