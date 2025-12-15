import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900';
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      default:
        'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 text-white shadow-neon-pink hover:brightness-110',
      outline:
        'border border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur shadow-sm',
      ghost: 'text-white hover:bg-white/10'
    };
    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-3 text-base'
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
