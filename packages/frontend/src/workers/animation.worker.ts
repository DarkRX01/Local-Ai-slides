interface AnimationMessage {
  type: 'calculate-path' | 'process-keyframes';
  payload: unknown;
}

interface AnimationResponse {
  type: 'success' | 'error';
  data?: unknown;
  error?: string;
}

self.onmessage = async (event: MessageEvent<AnimationMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'calculate-path':
        calculateAnimationPath(payload);
        break;
      case 'process-keyframes':
        processKeyframes(payload);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const response: AnimationResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(response);
  }
};

function calculateAnimationPath(payload: unknown): void {
  const { startX, startY, endX, endY, duration, easing } = payload as {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    duration: number;
    easing: string;
  };

  const steps = Math.ceil(duration / 16);
  const path: Array<{ x: number; y: number; time: number }> = [];

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const easedProgress = applyEasing(progress, easing);
    
    path.push({
      x: startX + (endX - startX) * easedProgress,
      y: startY + (endY - startY) * easedProgress,
      time: i * 16,
    });
  }

  const response: AnimationResponse = {
    type: 'success',
    data: path,
  };
  self.postMessage(response);
}

function processKeyframes(payload: unknown): void {
  const { keyframes } = payload as {
    keyframes: Array<{ time: number; properties: Record<string, unknown> }>;
  };

  const processed = keyframes.map((kf) => ({
    ...kf,
    computed: true,
  }));

  const response: AnimationResponse = {
    type: 'success',
    data: processed,
  };
  self.postMessage(response);
}

function applyEasing(t: number, easing: string): number {
  switch (easing) {
    case 'linear':
      return t;
    case 'ease-in':
      return t * t;
    case 'ease-out':
      return t * (2 - t);
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t;
  }
}
