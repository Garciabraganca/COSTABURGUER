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
    <Card className={cn('relative overflow-hidden rounded-2xl surface-card shadow-lg shadow-black/10 ring-1 ring-[var(--border-soft)] backdrop-blur', className)}>
      {(title || subtitle || headerAction) && (
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
          <div>
            {subtitle && <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">{subtitle}</p>}
            {title && <CardTitle className="text-lg font-semibold text-[color:var(--text-primary)]">{title}</CardTitle>}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </CardHeader>
      )}
      <CardContent className="pt-0 text-sm text-[color:var(--text-primary)]">{children}</CardContent>
    </Card>
  );
}
