import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Clock,
  FileText,
  Home,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  Truck
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  { key: 'CONFIRMADO', label: 'Confirmado', icon: Package },
  { key: 'COLETA', label: 'Coleta', icon: FileText },
  { key: 'ROTA', label: 'Rota', icon: MapPin },
  { key: 'A_CAMINHO', label: 'A caminho', icon: Truck },
  { key: 'ENTREGUE', label: 'Entrega', icon: Home }
];

type DeliveryWidgetProps = {
  entrega?: {
    pedidoId?: number | string | null;
    status?: string | null;
    eta?: string | null;
    motoboy?: string | null;
    avatarUrl?: string | null;
  };
};

export function DeliveryWidget({ entrega }: DeliveryWidgetProps) {
  if (!entrega) {
    return (
      <Card className="border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
            <Package className="h-5 w-5" /> Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70">
            Nenhuma entrega ativa no momento.
          </div>
          <Link
            href="/motoboy"
            className="inline-flex w-full items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-center font-semibold text-white hover:bg-white/20"
          >
            Ver entregas
          </Link>
        </CardContent>
      </Card>
    );
  }

  const currentStep = Math.max(0, steps.findIndex(step => step.key === entrega.status));

  return (
    <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm uppercase tracking-[0.2em] text-white/70">Entrega</CardTitle>
          <div className="mt-1 text-2xl font-bold">#{entrega.pedidoId ?? '—'}</div>
        </div>
        {entrega.eta && (
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
            <Clock className="h-4 w-4" /> ETA {entrega.eta}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const active = idx <= currentStep;
            return (
              <div key={step.key} className="flex flex-1 flex-col items-center gap-2 text-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition ${
                    active
                      ? 'border-emerald-300/70 bg-emerald-400/15 text-white shadow-neon-glow'
                      : 'border-white/20 bg-white/5 text-white/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs text-white/70">{step.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={entrega.avatarUrl ?? undefined} alt={entrega.motoboy ?? 'Motoboy'} />
              <AvatarFallback>{entrega.motoboy?.slice(0, 2).toUpperCase() ?? 'MB'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm text-white/70">Responsável</div>
              <div className="text-lg font-semibold">{entrega.motoboy ?? 'Motoboy'}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button">
              <Phone className="h-4 w-4" /> Ligar
            </Button>
            <Button variant="default" size="sm" type="button">
              <MessageSquare className="h-4 w-4" /> Mensagem
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
