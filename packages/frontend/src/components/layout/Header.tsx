import { Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Button } from '@/components/ui/Button';

export function Header() {
  const { theme, setTheme } = useSettingsStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800" role="banner">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Slides Clone</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode (Ctrl+Shift+T)' : 'Switch to dark mode (Ctrl+Shift+T)'}
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </Button>
      </div>
    </header>
  );
}
