import React, { useEffect, useRef, useState } from 'react';
import { useVoiceStore } from '@/store/voiceStore';
import { usePresentationStore } from '@/store/presentationStore';
import { useEditorStore } from '@/store/editorStore';
import { Button } from '@/components/ui/Button';

export const VoiceCommand: React.FC = () => {
  const {
    isListening,
    isProcessing,
    currentTranscript,
    lastCommand,
    settings,
    error,
    startListening,
    stopListening,
    transcribeAudio,
    parseCommand,
  } = useVoiceStore();

  const { currentPresentation, navigateToSlide, createSlide, deleteSlide } = usePresentationStore();
  const { setTheme } = useEditorStore();

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isListening && !mediaRecorder) {
      startRecording();
    } else if (!isListening && mediaRecorder) {
      stopRecording();
    }
  }, [isListening]);

  useEffect(() => {
    if (lastCommand) {
      executeCommand(lastCommand);
    }
  }, [lastCommand]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        setAudioChunks([]);

        try {
          const response = await transcribeAudio(audioBlob);
          await parseCommand(response.transcript);
        } catch (error) {
          console.error('Error processing audio:', error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const executeCommand = (command: any) => {
    if (!command || !currentPresentation) return;

    switch (command.type) {
      case 'navigate':
        if (command.target === 'next') {
          const currentIndex = currentPresentation.slides.findIndex(
            (s) => s.id === currentPresentation.slides[0]?.id
          );
          if (currentIndex < currentPresentation.slides.length - 1) {
            navigateToSlide(currentPresentation.slides[currentIndex + 1].id);
          }
        } else if (command.target === 'previous') {
          const currentIndex = currentPresentation.slides.findIndex(
            (s) => s.id === currentPresentation.slides[0]?.id
          );
          if (currentIndex > 0) {
            navigateToSlide(currentPresentation.slides[currentIndex - 1].id);
          }
        } else if (command.target === 'first') {
          navigateToSlide(currentPresentation.slides[0].id);
        } else if (command.target === 'last') {
          navigateToSlide(currentPresentation.slides[currentPresentation.slides.length - 1].id);
        } else if (command.target === 'specific' && typeof command.value === 'number') {
          const index = command.value - 1;
          if (index >= 0 && index < currentPresentation.slides.length) {
            navigateToSlide(currentPresentation.slides[index].id);
          }
        }
        break;

      case 'create':
        if (command.target === 'slide') {
          createSlide();
        }
        break;

      case 'delete':
        if (command.target === 'slide' && currentPresentation.slides.length > 1) {
          const currentSlideId = currentPresentation.slides[0]?.id;
          if (currentSlideId) {
            deleteSlide(currentSlideId);
          }
        }
        break;

      case 'theme':
        if (command.value === 'dark' || command.value === 'light') {
          setTheme(command.value);
        }
        break;

      case 'export':
        break;

      default:
        console.log('Unknown command type:', command.type);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!settings.enabled) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <Button
            onClick={handleToggleListening}
            className={`flex-shrink-0 w-12 h-12 rounded-full ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isProcessing}
          >
            {isListening ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="6" width="8" height="8" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3zm5 7a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7 7 0 0013.93 1H15a1 1 0 100-2h-.07A7.002 7.002 0 0015 10z" />
              </svg>
            )}
          </Button>

          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Voice Command'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {isListening ? 'Speak your command' : 'Click to start'}
            </div>
          </div>
        </div>

        {currentTranscript && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-300">
            <div className="font-medium mb-1">Transcript:</div>
            <div>{currentTranscript}</div>
          </div>
        )}

        {lastCommand && lastCommand.type !== 'unknown' && (
          <div className="mb-2 p-2 bg-green-100 dark:bg-green-900 rounded text-sm text-green-700 dark:text-green-300">
            <div className="font-medium mb-1">Command:</div>
            <div>
              {lastCommand.type} {lastCommand.target && `- ${lastCommand.target}`}
            </div>
          </div>
        )}

        {error && (
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
