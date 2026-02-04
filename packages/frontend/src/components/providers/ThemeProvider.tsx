import { ReactNode, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useSettingsStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme.mode === 'dark');
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (key === 'primary') {
        document.documentElement.style.setProperty('--color-primary-500', value);
      } else {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      }
    });
  }, [theme]);

  return <>{children}</>;
}
