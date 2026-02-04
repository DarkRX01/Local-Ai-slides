import React, { useState } from 'react';
import { AnimationPreset } from '@slides-clone/shared';
import { animationPresets, getAllCategories } from '@/lib/animationPresets';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Play } from 'lucide-react';

interface AnimationPresetBrowserProps {
  onSelect: (preset: AnimationPreset) => void;
  onPreview?: (preset: AnimationPreset) => void;
}

export const AnimationPresetBrowser: React.FC<AnimationPresetBrowserProps> = ({
  onSelect,
  onPreview,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AnimationPreset['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = getAllCategories();

  const filteredPresets = animationPresets.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         preset.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Animation Presets</h3>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search animations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPresets.map(preset => (
            <div
              key={preset.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer group"
              onClick={() => onSelect(preset)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{preset.name}</h4>
                  <p className="text-xs text-gray-400 capitalize">{preset.category}</p>
                </div>
                {onPreview && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(preset);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div className="bg-gray-900 rounded p-3 h-24 flex items-center justify-center">
                <div className="text-xs text-gray-500">
                  {preset.preview}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1 text-xs text-gray-400">
                <span>{preset.config.duration}ms</span>
                <span>•</span>
                <span>{preset.config.easing}</span>
              </div>
            </div>
          ))}
        </div>

        {filteredPresets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No presets found</p>
            <p className="text-sm mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
