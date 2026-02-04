import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Settings, Theme } from '@/types';

const defaultTheme: Theme = {
  name: 'default',
  mode: 'light',
  colors: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    foreground: '#0f172a',
    border: '#e2e8f0',
    panel: '#f8fafc',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
};

const darkTheme: Theme = {
  name: 'dark',
  mode: 'dark',
  colors: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#0f172a',
    foreground: '#f1f5f9',
    border: '#334155',
    panel: '#1e293b',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
  },
};

interface SettingsState extends Settings {
  availableThemes: Theme[];
  setLanguage: (language: string) => void;
  setTheme: (theme: Theme) => void;
  toggleThemeMode: () => void;
  updateThemeColors: (colors: Partial<Theme['colors']>) => void;
  setAutoSave: (autoSave: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowGuides: (show: boolean) => void;
  setAiModel: (model: string) => void;
  setImageQuality: (quality: Settings['imageQuality']) => void;
  reset: () => void;
}

const defaultSettings: Settings = {
  language: 'en',
  theme: defaultTheme,
  autoSave: true,
  autoSaveInterval: 30000,
  gridSize: 20,
  snapToGrid: true,
  showGuides: true,
  aiModel: 'llama3',
  imageQuality: 'standard',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      availableThemes: [defaultTheme, darkTheme],

      setLanguage: (language) => set({ language }),

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme.mode === 'dark');
        Object.entries(theme.colors).forEach(([key, value]) => {
          if (key === 'primary') {
            document.documentElement.style.setProperty('--color-primary-500', value);
          } else {
            document.documentElement.style.setProperty(`--color-${key}`, value);
          }
        });
      },

      toggleThemeMode: () =>
        set((state) => {
          const newMode = state.theme.mode === 'light' ? 'dark' : 'light';
          const newTheme = state.availableThemes.find((t) => t.mode === newMode) || state.theme;
          document.documentElement.classList.toggle('dark', newMode === 'dark');
          return { theme: newTheme };
        }),

      updateThemeColors: (colors) =>
        set((state) => ({
          theme: {
            ...state.theme,
            colors: { ...state.theme.colors, ...colors },
          },
        })),

      setAutoSave: (autoSave) => set({ autoSave }),

      setAutoSaveInterval: (interval) => set({ autoSaveInterval: interval }),

      setGridSize: (size) => set({ gridSize: size }),

      setSnapToGrid: (snap) => set({ snapToGrid: snap }),

      setShowGuides: (show) => set({ showGuides: show }),

      setAiModel: (model) => set({ aiModel: model }),

      setImageQuality: (quality) => set({ imageQuality: quality }),

      reset: () => set(defaultSettings),
    }),
    {
      name: 'presentation-app-settings',
    }
  )
);
