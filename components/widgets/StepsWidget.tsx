import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StepsWidget() {
  const total = 10000;
  const current = 6825;
  const percentage = Math.round((current / total) * 100);
  const completedSteps = 3;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white ring-1 ring-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(0,234,255,0.2),transparent_50%)]" />
      <CardHeader className="relative z-10 flex flex-row items-center justify-between">
        <CardTitle className="text-sm uppercase tracking-[0.2em] text-white/70">Steps</CardTitle>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">Meta 10k</span>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-5xl font-black leading-tight">{current.toLocaleString('pt-BR')}</div>
            <div className="text-sm text-white/70">de {total.toLocaleString('pt-BR')} ({percentage}%)</div>
          </div>
          <div className="flex items-center gap-2 text-emerald-300">
            <Check className="h-5 w-5" />
            <span className="text-sm font-semibold">Produtividade em alta</span>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          {Array.from({ length: 7 }).map((_, idx) => {
            const active = idx < completedSteps;
            return (
              <div
                key={idx}
                className={`flex h-12 w-12 items-center justify-center rounded-full border ${
                  active
                    ? 'border-emerald-300/60 bg-emerald-400/20 text-white shadow-neon-glow'
                    : 'border-white/20 bg-white/10 text-white/40'
                }`}
              >
                {active ? <Check className="h-5 w-5" /> : idx + 1}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
