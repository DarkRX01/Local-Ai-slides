import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { api } from '@/services/api';
import { Languages, Loader2 } from 'lucide-react';

interface TranslationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  onTranslate: (translatedText: string) => void;
}

export function TranslationDialog({ open, onOpenChange, text, onTranslate }: TranslationDialogProps) {
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadLanguages();
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
    try {
      const result = await api.translateText(
        text,
        targetLanguage,
        sourceLanguage === 'auto' ? undefined : sourceLanguage
      );
      setTranslatedText(result.translatedText);
    } catch (err: any) {
      console.error('Translation failed:', err);
      setError(err.response?.data?.message || 'Translation failed. Please ensure LibreTranslate is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (translatedText) {
      onTranslate(translatedText);
      onOpenChange(false);
      setTranslatedText('');
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Translate Text"
      description="Translate selected text to another language"
      size="large"
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {translatedText && (
            <Button onClick={handleApply}>
              Apply Translation
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Source Language</label>
          <Select
            value={sourceLanguage}
            onValueChange={setSourceLanguage}
            options={languages.map(lang => ({ value: lang.code, label: lang.name }))}
            placeholder="Select source language"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Language</label>
          <Select
            value={targetLanguage}
            onValueChange={setTargetLanguage}
            options={languages.filter(lang => lang.code !== 'auto').map(lang => ({ value: lang.code, label: lang.name }))}
            placeholder="Select target language"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Original Text</label>
          <div className="p-3 bg-background border border-border rounded-md max-h-32 overflow-y-auto">
            {text}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-md text-sm text-red-900 dark:text-red-400">
            {error}
          </div>
        )}

        {translatedText && (
          <div>
            <label className="block text-sm font-medium mb-1">Translated Text</label>
            <div className="p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-800 rounded-md max-h-32 overflow-y-auto">
              {translatedText}
            </div>
          </div>
        )}

        <Button
          onClick={handleTranslate}
          disabled={isLoading || !targetLanguage}
          className="w-full"
        >
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
      </div>
    </Modal>
  );
}
