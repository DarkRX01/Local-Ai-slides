import { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Slide, SlideElement } from '@shared/types';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ZoomControls } from './ZoomControls';

interface SlideCanvasProps {
  slide: Slide;
}

export function SlideCanvas({ slide }: SlideCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { updateSlide } = usePresentationStore();
  const { setSelectedElements, zoom } = useEditorStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 960,
      height: 540,
      backgroundColor: slide.background.value,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    canvas.on('selection:created', (e: fabric.IEvent) => {
      const selected = e.selected?.map((obj: fabric.Object) => (obj as any).elementId).filter(Boolean) || [];
      setSelectedElements(selected);
    });

    canvas.on('selection:updated', (e: fabric.IEvent) => {
      const selected = e.selected?.map((obj: fabric.Object) => (obj as any).elementId).filter(Boolean) || [];
      setSelectedElements(selected);
    });

    canvas.on('selection:cleared', () => {
      setSelectedElements([]);
    });

    canvas.on('object:modified', (e: fabric.IEvent) => {
      if (!e.target) return;
      const elementId = (e.target as any).elementId;
      if (!elementId) return;

      const updatedElements = slide.elements.map((el) => {
        if (el.id === elementId) {
          return {
            ...el,
            position: { x: e.target!.left || 0, y: e.target!.top || 0 },
            size: { 
              width: (e.target!.width || 0) * (e.target!.scaleX || 1), 
              height: (e.target!.height || 0) * (e.target!.scaleY || 1) 
            },
            rotation: e.target!.angle || 0,
          };
        }
        return el;
      });

      updateSlide(slide.id, { elements: updatedElements });
    });

    renderElements(canvas, slide.elements);

    return () => {
      canvas.dispose();
    };
  }, [slide.id]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.setZoom(zoom);
    fabricCanvasRef.current.renderAll();
  }, [zoom]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    fabricCanvasRef.current.backgroundColor = slide.background.value;
    fabricCanvasRef.current.renderAll();
  }, [slide.background]);

  useEffect(() => {
    if (!fabricCanvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    
    canvas.clear();
    canvas.backgroundColor = slide.background.value;
    renderElements(canvas, slide.elements);
  }, [slide.elements]);

  const renderElements = (canvas: fabric.Canvas, elements: SlideElement[]) => {
    elements.forEach((element) => {
      let fabricObject: fabric.Object | null = null;

      if (element.type === 'text' && 'content' in element.properties) {
        const props = element.properties as any;
        fabricObject = new fabric.Text(props.content, {
          left: element.position.x,
          top: element.position.y,
          fontSize: props.fontSize,
          fontFamily: props.fontFamily,
          fontWeight: props.fontWeight,
          fill: props.color,
          textAlign: props.align,
        });
      } else if (element.type === 'shape' && 'type' in element.properties) {
        const props = element.properties as any;
        if (props.type === 'rectangle') {
          fabricObject = new fabric.Rect({
            left: element.position.x,
            top: element.position.y,
            width: element.size.width,
            height: element.size.height,
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth,
          });
        } else if (props.type === 'circle') {
          fabricObject = new fabric.Circle({
            left: element.position.x,
            top: element.position.y,
            radius: element.size.width / 2,
            fill: props.fill,
            stroke: props.stroke,
            strokeWidth: props.strokeWidth,
          });
        }
      } else if (element.type === 'image' && 'url' in element.properties) {
        const props = element.properties as any;
        fabric.Image.fromURL(props.url, (img: fabric.Image) => {
          img.set({
            left: element.position.x,
            top: element.position.y,
            scaleX: element.size.width / (img.width || 1),
            scaleY: element.size.height / (img.height || 1),
          });
          (img as any).elementId = element.id;
          canvas.add(img);
        });
        return;
      }

      if (fabricObject) {
        fabricObject.set({
          angle: element.rotation,
        });
        (fabricObject as any).elementId = element.id;
        canvas.add(fabricObject);
      }
    });

    canvas.renderAll();
  };

  useKeyboardShortcuts(fabricCanvasRef.current);

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center">
      <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <canvas ref={canvasRef} />
      </div>
      <ZoomControls />
    </div>
  );
}
