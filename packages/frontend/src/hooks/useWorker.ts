import { useRef, useEffect, useCallback } from 'react';

interface UseWorkerOptions<T, R> {
  onMessage?: (data: R) => void;
  onError?: (error: Error) => void;
}

export function useWorker<T = unknown, R = unknown>(
  workerPath: string,
  options: UseWorkerOptions<T, R> = {}
) {
  const workerRef = useRef<Worker | null>(null);
  const { onMessage, onError } = options;

  useEffect(() => {
    workerRef.current = new Worker(new URL(workerPath, import.meta.url), {
      type: 'module',
    });

    workerRef.current.onmessage = (event: MessageEvent<R>) => {
      onMessage?.(event.data);
    };

    workerRef.current.onerror = (error) => {
      onError?.(new Error(error.message));
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [workerPath, onMessage, onError]);

  const postMessage = useCallback((data: T) => {
    workerRef.current?.postMessage(data);
  }, []);

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return { postMessage, terminate };
}
