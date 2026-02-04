import React, { useState } from 'react';
import { Keyframe, EasingType } from '@slides-clone/shared';
import { Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface KeyframeEditorProps {
  keyframes: Keyframe[];
  duration: number;
  onChange: (keyframes: Keyframe[]) => void;
}

export const KeyframeEditor: React.FC<KeyframeEditorProps> = ({
  keyframes,
  duration,
  onChange,
}) => {
  const [selectedKeyframeIndex, setSelectedKeyframeIndex] = useState<number | null>(null);
  const [propertyName, setPropertyName] = useState('');
  const [propertyValue, setPropertyValue] = useState('');

  const easingOptions: EasingType[] = [
    'linear',
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'power1.in',
    'power1.out',
    'power1.inOut',
    'power2.in',
    'power2.out',
    'power2.inOut',
    'power3.in',
    'power3.out',
    'power3.inOut',
    'power4.in',
    'power4.out',
    'power4.inOut',
    'back.in',
    'back.out',
    'back.inOut',
    'elastic.in',
    'elastic.out',
    'elastic.inOut',
    'bounce.in',
    'bounce.out',
    'bounce.inOut',
  ];

  const addKeyframe = () => {
    const newTime = keyframes.length > 0 
      ? Math.min(duration, Math.max(...keyframes.map(k => k.time)) + 1000)
      : 0;

    const newKeyframe: Keyframe = {
      time: newTime,
      properties: {},
      easing: 'ease-in-out',
    };

    onChange([...keyframes, newKeyframe].sort((a, b) => a.time - b.time));
  };

  const deleteKeyframe = (index: number) => {
    const updated = keyframes.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedKeyframeIndex === index) {
      setSelectedKeyframeIndex(null);
    }
  };

  const duplicateKeyframe = (index: number) => {
    const keyframe = keyframes[index];
    const newKeyframe: Keyframe = {
      ...keyframe,
      time: Math.min(duration, keyframe.time + 100),
      properties: { ...keyframe.properties },
    };
    onChange([...keyframes, newKeyframe].sort((a, b) => a.time - b.time));
  };

  const updateKeyframeTime = (index: number, time: number) => {
    const updated = [...keyframes];
    updated[index] = { ...updated[index], time: Math.max(0, Math.min(duration, time)) };
    onChange(updated.sort((a, b) => a.time - b.time));
  };

  const updateKeyframeEasing = (index: number, easing: EasingType) => {
    const updated = [...keyframes];
    updated[index] = { ...updated[index], easing };
    onChange(updated);
  };

  const addProperty = (index: number) => {
    if (!propertyName || !propertyValue) return;

    const updated = [...keyframes];
    const value = isNaN(Number(propertyValue)) ? propertyValue : Number(propertyValue);
    updated[index] = {
      ...updated[index],
      properties: {
        ...updated[index].properties,
        [propertyName]: value,
      },
    };
    onChange(updated);
    setPropertyName('');
    setPropertyValue('');
  };

  const removeProperty = (keyframeIndex: number, propertyKey: string) => {
    const updated = [...keyframes];
    const newProperties = { ...updated[keyframeIndex].properties };
    delete newProperties[propertyKey];
    updated[keyframeIndex] = { ...updated[keyframeIndex], properties: newProperties };
    onChange(updated);
  };

  const updateProperty = (keyframeIndex: number, propertyKey: string, value: string) => {
    const updated = [...keyframes];
    const numValue = isNaN(Number(value)) ? value : Number(value);
    updated[keyframeIndex] = {
      ...updated[keyframeIndex],
      properties: {
        ...updated[keyframeIndex].properties,
        [propertyKey]: numValue,
      },
    };
    onChange(updated);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Keyframes</h3>
          <Button size="sm" onClick={addKeyframe}>
            <Plus className="w-4 h-4 mr-2" />
            Add Keyframe
          </Button>
        </div>
        <p className="text-sm text-gray-400">
          {keyframes.length} keyframe{keyframes.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {keyframes.map((keyframe, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              selectedKeyframeIndex === index
                ? 'border-blue-500 bg-gray-800'
                : 'border-gray-700 bg-gray-850'
            }`}
            onClick={() => setSelectedKeyframeIndex(index)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">
                Keyframe {index + 1}
              </h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateKeyframe(index);
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteKeyframe(index);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Time (ms)
                </label>
                <Input
                  type="number"
                  value={keyframe.time}
                  onChange={(e) => updateKeyframeTime(index, Number(e.target.value))}
                  min={0}
                  max={duration}
                  step={100}
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Easing
                </label>
                <Select
                  value={keyframe.easing || 'ease-in-out'}
                  onChange={(e) => updateKeyframeEasing(index, e.target.value as EasingType)}
                >
                  {easingOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  Properties
                </label>
                <div className="space-y-2">
                  {Object.entries(keyframe.properties).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input
                        value={key}
                        disabled
                        className="flex-1"
                      />
                      <Input
                        value={String(value)}
                        onChange={(e) => updateProperty(index, key, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeProperty(index, key)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}

                  {selectedKeyframeIndex === index && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                      <Input
                        placeholder="Property name"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => addProperty(index)}
                        disabled={!propertyName || !propertyValue}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {keyframes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No keyframes yet</p>
            <p className="text-sm mt-2">Click "Add Keyframe" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};
