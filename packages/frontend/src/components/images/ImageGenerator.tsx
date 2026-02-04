import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Sparkles, Loader2, AlertCircle, CheckCircle, Settings } from 'lucide-react';

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onImageGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('low quality, blurry, distorted');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [cfgScale, setCfgScale] = useState(7);
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const jobStatus = await api.getImageGenerationStatus(jobId);
        
        if (jobStatus.status === 'completed' && jobStatus.result) {
          setStatus('completed');
          const imageUrl = `/api/images/file/${jobStatus.result}`;
          setGeneratedImageUrl(imageUrl);
          clearInterval(pollInterval);
        } else if (jobStatus.status === 'failed') {
          setStatus('failed');
          setError(jobStatus.error || 'Image generation failed');
          clearInterval(pollInterval);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check job status');
        setStatus('failed');
        clearInterval(pollInterval);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [jobId]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setStatus('generating');
    setError(null);
    setJobId(null);
    setGeneratedImageUrl(null);

    try {
      const { jobId: newJobId } = await api.generateImage({
        prompt,
        negativePrompt,
        width,
        height,
        steps,
        cfgScale,
      });

      setJobId(newJobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start image generation');
      setStatus('failed');
    }
  };

  const handleUseImage = () => {
    if (generatedImageUrl) {
      onImageGenerated(generatedImageUrl);
      setStatus('idle');
      setGeneratedImageUrl(null);
      setPrompt('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
          <textarea
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={status === 'generating'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Negative Prompt</label>
          <Input
            type="text"
            placeholder="What to avoid in the image..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            disabled={status === 'generating'}
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <Settings className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || 512)}
                min={64}
                max={2048}
                step={64}
                disabled={status === 'generating'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
              <Input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || 512)}
                min={64}
                max={2048}
                step={64}
                disabled={status === 'generating'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Steps</label>
              <Input
                type="number"
                value={steps}
                onChange={(e) => setSteps(parseInt(e.target.value) || 20)}
                min={1}
                max={150}
                disabled={status === 'generating'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CFG Scale</label>
              <Input
                type="number"
                value={cfgScale}
                onChange={(e) => setCfgScale(parseFloat(e.target.value) || 7)}
                min={1}
                max={30}
                step={0.5}
                disabled={status === 'generating'}
              />
            </div>
          </div>
        )}

        <Button onClick={handleGenerate} disabled={!prompt.trim() || status === 'generating'} className="w-full">
          {status === 'generating' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {status === 'generating' && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600">Generating your image...</p>
            <p className="text-xs text-gray-400 mt-1">This may take a minute</p>
          </div>
        </div>
      )}

      {status === 'completed' && generatedImageUrl && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Image generated successfully!</span>
          </div>
          
          <div className="relative max-w-full rounded-lg overflow-hidden border-2 border-gray-200">
            <img src={generatedImageUrl} alt="Generated" className="max-w-full h-auto" />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUseImage}>Use This Image</Button>
            <Button onClick={() => handleGenerate()} variant="outline">
              Generate Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
