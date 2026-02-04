import React, { useState } from 'react';
import { api } from '@/services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search, Download, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ImageResult {
  url: string;
  thumbnail: string;
  title: string;
}

interface ImageSearchProps {
  onImageSelect: (imageUrl: string) => void;
}

export const ImageSearch: React.FC<ImageSearchProps> = ({ onImageSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMethod, setSearchMethod] = useState<'google' | 'scrape'>('google');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let searchResults: ImageResult[];
      
      if (searchMethod === 'google') {
        searchResults = await api.searchGoogleImages(query, 10);
      } else {
        searchResults = await api.scrapeImages(query, 10);
      }

      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images');
      console.error('Image search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAndSelect = async (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setError(null);

    try {
      const { url } = await api.downloadImage(imageUrl);
      onImageSelect(url);
      setSelectedImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download image');
      setSelectedImage(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search for images..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <select
          value={searchMethod}
          onChange={(e) => setSearchMethod(e.target.value as 'google' | 'scrape')}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="google">Google API</option>
          <option value="scrape">Scrape</option>
        </select>
        <Button onClick={handleSearch} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Search
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-sm text-gray-600">Searching images...</p>
          </div>
        </div>
      )}

      {!loading && results.length === 0 && !error && (
        <div className="flex items-center justify-center flex-1 text-gray-400">
          <div className="text-center">
            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Search for images to get started</p>
          </div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="group relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              onClick={() => handleDownloadAndSelect(result.url)}
            >
              <div className="aspect-square">
                <img
                  src={result.thumbnail || result.url}
                  alt={result.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {selectedImage === result.url ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Download className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                <p className="text-xs text-white truncate" title={result.title}>
                  {result.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
