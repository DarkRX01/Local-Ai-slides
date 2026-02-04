import { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export function Modal({ open, onOpenChange, title, description, children, footer, size = 'medium' }: ModalProps) {
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-4xl',
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-panel rounded-lg shadow-lg p-6 w-full ${sizeClasses[size]} z-50`}>
          <Dialog.Title className="text-lg font-semibold mb-2">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="text-sm text-foreground/70 mb-4">
              {description}
            </Dialog.Description>
          )}
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>
          <div className="mt-4">{children}</div>
          {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
