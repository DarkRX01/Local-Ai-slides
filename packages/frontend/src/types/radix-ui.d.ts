declare module '@radix-ui/react-dialog' {
  import * as React from 'react';
  
  export const Root: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }>;
  export const Portal: React.FC<{ children: React.ReactNode }>;
  export const Overlay: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const Content: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  export const Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  export const Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
  export const Close: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
}

declare module '@radix-ui/react-tooltip' {
  import * as React from 'react';
  
  export const Provider: React.FC<{ delayDuration?: number; children: React.ReactNode }>;
  export const Root: React.FC<{ children: React.ReactNode }>;
  export const Trigger: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
  export const Portal: React.FC<{ children: React.ReactNode }>;
  export const Content: React.FC<React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'right' | 'bottom' | 'left'; sideOffset?: number }>;
  export const Arrow: React.FC<React.HTMLAttributes<SVGSVGElement>>;
}
