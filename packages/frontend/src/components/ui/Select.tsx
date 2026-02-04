import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export function Select({ value, onValueChange, options, placeholder = 'Select...' }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        className={clsx(
          'inline-flex items-center justify-between rounded-md border border-border',
          'bg-background px-3 py-2 text-sm w-full',
          'focus:outline-none focus:ring-2 focus:ring-primary-500'
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="overflow-hidden bg-panel rounded-md shadow-lg border border-border z-50">
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={clsx(
                  'relative flex items-center px-8 py-2 text-sm rounded-sm',
                  'focus:bg-primary-100 focus:outline-none cursor-pointer'
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2">
                  <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
