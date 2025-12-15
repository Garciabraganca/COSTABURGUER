import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, subtitle, className, headerAction, children }: SectionCardProps) {
  return (
    <Card className={cn('relative overflow-hidden rounded-2xl bg-white/5 text-white shadow-lg shadow-black/30 ring-1 ring-white/10 backdrop-blur', className)}>
      {(title || subtitle || headerAction) && (
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
          <div>
            {subtitle && <p className="text-xs uppercase tracking-[0.2em] text-white/60">{subtitle}</p>}
            {title && <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className="pt-0 text-sm text-white/90">{children}</CardContent>
    </Card>
  );
}
