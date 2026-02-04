import React, { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ImageSearch } from './ImageSearch';
import { ImageGenerator } from './ImageGenerator';
import { Upload, Sparkles, Search, Image as ImageIcon, X } from 'lucide-react';

interface ImageLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

type TabType = 'search' | 'generate' | 'upload';

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ isOpen, onClose, onImageSelect }) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = (imageUrl: string) => {
    onImageSelect(imageUrl);
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploadPreview(base64);

      setUploading(true);
      try {
        const { url } = await api.uploadImage(base64);
        handleImageSelect(url);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
        setUploadPreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'search' as TabType, label: 'Search', icon: Search },
    { id: 'generate' as TabType, label: 'Generate', icon: Sparkles },
    { id: 'upload' as TabType, label: 'Upload', icon: Upload },
  ];

  return (
    <Modal open={isOpen} onOpenChange={handleOpenChange} title="Image Library" size="large">
      <div className="flex flex-col h-[600px]">
        <div className="flex border-b border-gray-200 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'search' && <ImageSearch onImageSelect={handleImageSelect} />}

          {activeTab === 'generate' && <ImageGenerator onImageGenerated={handleImageSelect} />}

          {activeTab === 'upload' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                {uploadPreview ? (
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img src={uploadPreview} alt="Upload preview" className="max-w-full max-h-96 rounded-lg" />
                      {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <div className="text-white">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                            <p className="text-sm">Uploading...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {!uploading && (
                      <Button onClick={() => setUploadPreview(null)} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload an Image</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Click the button below or drag and drop an image file
                    </p>
                    <label className="inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-white hover:bg-primary-600 h-10 px-4 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
