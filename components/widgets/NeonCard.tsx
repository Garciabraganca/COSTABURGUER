import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Accent = 'green' | 'cyan' | 'pink' | 'amber' | 'blue';

type NeonCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  accent?: Accent;
};

const accentClasses: Record<Accent, string> = {
  green: 'from-emerald-500/40 via-emerald-400/30 to-emerald-300/30 ring-emerald-300/40 shadow-neon-glow',
  cyan: 'from-cyan-500/40 via-sky-400/30 to-blue-400/20 ring-cyan-300/40 shadow-neon-cyan',
  pink: 'from-pink-500/40 via-fuchsia-400/30 to-purple-400/30 ring-pink-300/40 shadow-neon-pink',
  amber: 'from-amber-500/40 via-orange-400/30 to-yellow-300/30 ring-amber-300/40 shadow-[0_10px_40px_rgba(255,193,7,0.25)]',
  blue: 'from-indigo-500/40 via-blue-500/30 to-sky-400/30 ring-indigo-300/40 shadow-[0_10px_40px_rgba(79,70,229,0.25)]'
};

export function NeonCard({ title, value, subtitle, icon: Icon, accent = 'green' }: NeonCardProps) {
  return (
    <Card className={cn('relative overflow-hidden border-white/10 bg-gradient-to-br text-white ring-1', accentClasses[accent])}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
      <CardHeader className="relative z-10 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm uppercase tracking-[0.2em] text-white/70">{title}</CardTitle>
          <div className="mt-2 text-4xl font-black leading-tight drop-shadow">{value}</div>
          {subtitle && <CardDescription className="mt-2 text-white/70">{subtitle}</CardDescription>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
          <Icon className="h-6 w-6" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10" />
    </Card>
  );
}
