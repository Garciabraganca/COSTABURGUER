import * as React from 'react';
import { cn } from '@/lib/utils';

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  fallback?: string;
  src?: string;
};

export function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt ?? ''}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  );
}

export function AvatarFallback({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black/20 text-sm font-semibold text-white">
      {children ?? '??'}
    </div>
  );
}
