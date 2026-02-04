import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { PropertyPanel } from '@/components/layout/PropertyPanel';
import { SlideEditor } from '@/components/editor/SlideEditor';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

function App() {
  const { theme } = useSettingsStore();
  const { setCurrentPresentation } = usePresentationStore();
  
  useKeyboardShortcuts();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const demoPresentation = {
      id: 'demo-1',
      title: 'Demo Presentation',
      slides: [
        {
          id: 'slide-1',
          presentationId: 'demo-1',
          order: 0,
          background: { type: 'color' as const, value: '#ffffff' },
          elements: [],
          animations: [],
        },
      ],
      theme: {
        name: 'Default',
        mode: 'light' as const,
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          background: '#ffffff',
          text: '#000000',
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentPresentation(demoPresentation);
  }, [setCurrentPresentation]);

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-gray-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1" role="main" aria-label="Slide editor">
          <SlideEditor />
        </main>
        <PropertyPanel />
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
