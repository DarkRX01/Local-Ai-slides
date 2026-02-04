import React, { useEffect } from 'react';
import { useVoiceStore } from '@/store/voiceStore';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';

export const VoiceSettings: React.FC = () => {
  const { settings, availableVoices, updateSettings, loadAvailableVoices } = useVoiceStore();

  useEffect(() => {
    loadAvailableVoices();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Voice Settings
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Enable Voice Commands
          </label>
          <button
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Language
          </label>
          <Select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="w-full"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Voice
          </label>
          <Select
            value={settings.voice}
            onChange={(e) => updateSettings({ voice: e.target.value })}
            className="w-full"
          >
            {availableVoices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Speed: {settings.speed.toFixed(1)}x
          </label>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={settings.speed}
            onChange={(value) => updateSettings({ speed: value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Pitch: {settings.pitch.toFixed(1)}
          </label>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={settings.pitch}
            onChange={(value) => updateSettings({ pitch: value })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Auto-generate Voice-overs
          </label>
          <button
            onClick={() => updateSettings({ autoGenerateVoiceOvers: !settings.autoGenerateVoiceOvers })}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              settings.autoGenerateVoiceOvers ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                settings.autoGenerateVoiceOvers ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
          Voice Commands Help
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>• "Next slide" - Navigate to next slide</div>
          <div>• "Previous slide" - Navigate to previous slide</div>
          <div>• "Go to slide [number]" - Navigate to specific slide</div>
          <div>• "Create slide" - Add a new slide</div>
          <div>• "Delete slide" - Remove current slide</div>
          <div>• "Dark mode" / "Light mode" - Change theme</div>
          <div>• "Export to PDF/PPTX" - Export presentation</div>
        </div>
      </div>
    </div>
  );
};
