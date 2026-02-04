import React, { useState, useEffect } from 'react';
import { useAIStore } from '@/store/aiStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';

interface PromptTemplate {
  name: string;
  prompt: string;
  slideCount: number;
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    name: 'Business Pitch',
    prompt: 'Create a compelling pitch deck for a startup',
    slideCount: 10,
  },
  {
    name: 'Educational',
    prompt: 'Create an educational presentation about',
    slideCount: 15,
  },
  {
    name: 'Marketing Campaign',
    prompt: 'Design a marketing presentation for',
    slideCount: 12,
  },
  {
    name: 'Product Launch',
    prompt: 'Create a product launch presentation for',
    slideCount: 10,
  },
  {
    name: 'Technical Deep Dive',
    prompt: 'Create a technical presentation explaining',
    slideCount: 20,
  },
  {
    name: 'Research Findings',
    prompt: 'Present research findings on',
    slideCount: 15,
  },
];

export const AIAssistant: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  const {
    isGenerating,
    availableModels,
    selectedModel,
    temperature,
    error,
    aiStatus,
    setSelectedModel,
    setTemperature,
    checkAIHealth,
    loadModels,
    generatePresentation,
  } = useAIStore();

  const [prompt, setPrompt] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('');
  const [includeImages, setIncludeImages] = useState(false);
  const [animationLevel, setAnimationLevel] = useState<'none' | 'basic' | 'advanced'>('basic');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      checkAIHealth();
      loadModels();
    }
  }, [isOpen, checkAIHealth, loadModels]);

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    if (templateName) {
      const template = PROMPT_TEMPLATES.find((t) => t.name === templateName);
      if (template) {
        setPrompt(template.prompt);
        setSlideCount(template.slideCount);
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    try {
      const result = await generatePresentation({
        prompt: prompt.trim(),
        slideCount,
        language,
        theme: theme || undefined,
        includeImages,
        animationLevel,
      });

      if (result.status === 'success' && result.presentationId) {
        onClose();
      }
    } catch (err) {
      console.error('Failed to generate presentation:', err);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange} title="AI Presentation Generator">
      <div className="space-y-6">
        {aiStatus === 'unavailable' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              AI service is not available. Please make sure Ollama is running.
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template (Optional)</label>
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateSelect}
              options={[
                { value: '', label: 'Custom Prompt' },
                ...PROMPT_TEMPLATES.map((template) => ({
                  value: template.name,
                  label: template.name
                }))
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the presentation you want to create..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Slides</label>
              <Input
                type="number"
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <Select
                value={language}
                onValueChange={setLanguage}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                  { value: 'zh', label: 'Chinese' },
                  { value: 'ar', label: 'Arabic' },
                  { value: 'hi', label: 'Hindi' },
                  { value: 'ru', label: 'Russian' }
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme/Color</label>
            <Input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g., blue, professional, dark..."
              disabled={isGenerating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Animation Level</label>
            <Select
              value={animationLevel}
              onValueChange={(value) => setAnimationLevel(value as 'none' | 'basic' | 'advanced')}
              options={[
                { value: 'none', label: 'None' },
                { value: 'basic', label: 'Basic' },
                { value: 'advanced', label: 'Advanced' }
              ]}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeImages"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              disabled={isGenerating}
              className="mr-2"
            />
            <label htmlFor="includeImages" className="text-sm text-gray-700">
              Suggest images for slides
            </label>
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Settings</h4>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                <Select
                  value={selectedModel}
                  onValueChange={setSelectedModel}
                  options={
                    availableModels.length > 0
                      ? availableModels.map((model) => ({ value: model, label: model }))
                      : [{ value: 'llama3', label: 'llama3 (default)' }]
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  disabled={isGenerating}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button onClick={onClose} variant="secondary" disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || aiStatus === 'unavailable'}
          >
            {isGenerating ? 'Generating...' : 'Generate Presentation'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
