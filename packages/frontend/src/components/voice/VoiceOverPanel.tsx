import React, { useEffect, useState } from 'react';
import { useVoiceStore } from '@/store/voiceStore';
import { Button } from '@/components/ui/Button';
import type { SlideVoiceOver } from '@slides-clone/shared';

interface VoiceOverPanelProps {
  slideId: string;
}

export const VoiceOverPanel: React.FC<VoiceOverPanelProps> = ({ slideId }) => {
  const {
    isProcessing,
    isSpeaking,
    settings,
    generateVoiceOver,
    getVoiceOver,
    deleteVoiceOver,
    playVoiceOver,
    stopSpeaking,
  } = useVoiceStore();

  const [voiceOver, setVoiceOver] = useState<SlideVoiceOver | null>(null);
  const [customText, setCustomText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadVoiceOver();
  }, [slideId]);

  const loadVoiceOver = async () => {
    const vo = await getVoiceOver(slideId);
    setVoiceOver(vo);
  };

  const handleGenerate = async () => {
    try {
      await generateVoiceOver(slideId, {
        text: customText || undefined,
      });
      await loadVoiceOver();
      setIsEditing(false);
      setCustomText('');
    } catch (error) {
      console.error('Failed to generate voice-over:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteVoiceOver(slideId);
      setVoiceOver(null);
    } catch (error) {
      console.error('Failed to delete voice-over:', error);
    }
  };

  const handlePlay = async () => {
    try {
      if (isSpeaking) {
        stopSpeaking();
      } else {
        await playVoiceOver(slideId);
      }
    } catch (error) {
      console.error('Failed to play voice-over:', error);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Voice-over</h3>
        {voiceOver && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {voiceOver.duration}s
          </span>
        )}
      </div>

      {voiceOver ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={handlePlay}
              className={`flex-1 ${isSpeaking ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isSpeaking ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="6" y="6" width="3" height="8" />
                    <rect x="11" y="6" width="3" height="8" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Play
                </>
              )}
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Language: {voiceOver.language.toUpperCase()}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {isEditing && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Text (optional)
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Leave empty to use slide text"
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  {isProcessing ? 'Generating...' : 'Generate'}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setCustomText('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                disabled={!settings.enabled}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a3 3 0 00-3 3v4a3 3 0 006 0V6a3 3 0 00-3-3zm5 7a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7 7 0 0013.93 1H15a1 1 0 100-2h-.07A7.002 7.002 0 0015 10z" />
                </svg>
                Generate Voice-over
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
