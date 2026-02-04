import { BrowserWindow, screen } from 'electron';
import Store from 'electron-store';

interface WindowState {
  x: number | undefined;
  y: number | undefined;
  width: number;
  height: number;
  isMaximized: boolean;
}

const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

export class WindowStateManager {
  private store: Store<{ windowState: WindowState }>;
  private state: WindowState;
  private window: BrowserWindow | null = null;
  private stateChangeTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.store = new Store<{ windowState: WindowState }>({
      name: 'window-state',
    });

    const defaultState = this.getDefaultState();
    this.state = this.store.get('windowState', defaultState);
    this.ensureVisible();
  }

  private getDefaultState(): WindowState {
    const { bounds } = screen.getPrimaryDisplay();
    return {
      x: undefined,
      y: undefined,
      width: Math.min(DEFAULT_WIDTH, bounds.width),
      height: Math.min(DEFAULT_HEIGHT, bounds.height),
      isMaximized: false,
    };
  }

  private ensureVisible(): void {
    const visible = screen.getAllDisplays().some((display) => {
      const { x, y, width, height } = display.bounds;
      return (
        this.state.x !== undefined &&
        this.state.y !== undefined &&
        this.state.x >= x &&
        this.state.y >= y &&
        this.state.x + this.state.width <= x + width &&
        this.state.y + this.state.height <= y + height
      );
    });

    if (!visible) {
      this.state.x = undefined;
      this.state.y = undefined;
    }
  }

  getState(): WindowState {
    return this.state;
  }

  track(window: BrowserWindow): void {
    this.window = window;

    const updateState = () => {
      if (!this.window || this.window.isDestroyed()) {
        return;
      }

      const bounds = this.window.getBounds();
      const isMaximized = this.window.isMaximized();

      if (!isMaximized) {
        this.state = {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          isMaximized: false,
        };
      } else {
        this.state.isMaximized = true;
      }

      this.saveState();
    };

    const throttledUpdate = () => {
      if (this.stateChangeTimer) {
        clearTimeout(this.stateChangeTimer);
      }
      this.stateChangeTimer = setTimeout(updateState, 500);
    };

    window.on('resize', throttledUpdate);
    window.on('move', throttledUpdate);
    window.on('maximize', updateState);
    window.on('unmaximize', updateState);
    window.on('close', updateState);
  }

  private saveState(): void {
    this.store.set('windowState', this.state);
  }
}
