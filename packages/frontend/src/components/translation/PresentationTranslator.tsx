import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { api } from '@/services/api';
import { Languages, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface PresentationTranslatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presentationId: string;
  presentationTitle: string;
  onComplete: () => void;
}

export function PresentationTranslator({
  open,
  onOpenChange,
  presentationId,
  presentationTitle,
  onComplete,
}: PresentationTranslatorProps) {
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [slidesTranslated, setSlidesTranslated] = useState(0);

  useEffect(() => {
    if (open) {
      loadLanguages();
      setSuccess(false);
      setSlidesTranslated(0);
      setError('');
    }
  }, [open]);

  const loadLanguages = async () => {
    try {
      const langs = await api.getAvailableLanguages();
      setLanguages([{ code: 'auto', name: 'Auto-detect' }, ...langs]);
    } catch (err) {
      console.error('Failed to load languages:', err);
      setError('Failed to load available languages');
    }
  };

  const handleTranslate = async () => {
    if (!targetLanguage) {
      setError('Please select a target language');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess(false);
    try {
      const result = await api.translatePresentation(
        presentationId,
        targetLanguage,
        sourceLanguage === 'auto' ? undefined : sourceLanguage
      );
      setSlidesTranslated(result.slidesTranslated);
      setSuccess(true);
      setTimeout(() => {
        onComplete();
        onOpenChange(false);
      }, 2000);
    } catch (err: any) {
      console.error('Translation failed:', err);
      setError(
        err.response?.data?.message || 
        'Translation failed. Please ensure LibreTranslate is running on port 5000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Translate Presentation"
      description={`Translate "${presentationTitle}" to another language`}
      size="medium"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {success ? 'Close' : 'Cancel'}
          </Button>
          {!success && (
            <Button onClick={handleTranslate} disabled={isLoading || !targetLanguage}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate
                </>
              )}
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {!success && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Source Language</label>
              <Select
                value={sourceLanguage}
                onValueChange={setSourceLanguage}
                options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
                placeholder="Select source language"
              />
              <p className="mt-1 text-xs text-foreground/60">
                Select "Auto-detect" to automatically detect the source language
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Language</label>
              <Select
                value={targetLanguage}
                onValueChange={setTargetLanguage}
                options={languages
                  .filter(lang => lang.code !== 'auto')
                  .map(lang => ({ value: lang.code, label: lang.name }))}
                placeholder="Select target language"
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-900 dark:text-blue-400">
                <strong>Note:</strong> This will translate all text elements, slide notes, presentation title and
                description to the selected language. The original content will be replaced.
              </p>
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-900 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-900 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-md flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-400">
                Translation completed successfully!
              </p>
              <p className="text-sm text-green-800 dark:text-green-500 mt-1">
                Translated {slidesTranslated} slide{slidesTranslated !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
