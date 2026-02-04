import { useEffect } from 'react';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useEditorStore } from '@/stores/useEditorStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

export function useKeyboardShortcuts() {
  const { addSlide, currentPresentation, setCurrentSlideId, deleteSlide } = usePresentationStore();
  const { undo, redo, canUndo, canRedo, selectedElements, deleteElements, copyElements, pasteElements } = useEditorStore();
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrl && e.key === 'z' && !isShift) {
        e.preventDefault();
        if (canUndo) undo();
      }

      if ((isCtrl && e.key === 'y') || (isCtrl && isShift && e.key === 'z')) {
        e.preventDefault();
        if (canRedo) redo();
      }

      if (isCtrl && e.key === 'c' && selectedElements.length > 0) {
        e.preventDefault();
        copyElements();
      }

      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        pasteElements();
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElements.length > 0) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          deleteElements(selectedElements);
        }
      }

      if (isCtrl && e.key === 'n') {
        e.preventDefault();
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
      }

      if (isCtrl && isShift && e.key === 'T') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
        document.documentElement.classList.toggle('dark');
      }

      if (e.key === 'F11') {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        if (selectedElements.length > 0) {
          useEditorStore.getState().setSelectedElements([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, selectedElements, currentPresentation, theme, undo, redo, copyElements, pasteElements, deleteElements, addSlide, setCurrentSlideId, setTheme]);
}
