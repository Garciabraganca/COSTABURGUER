import { safeGetSessionFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GerenteNav } from '@/components/GerenteNav';
import { NeonCard } from '@/components/widgets/NeonCard';
import { SectionCard } from '@/components/widgets/SectionCard';
import { StepsWidget } from '@/components/widgets/StepsWidget';
import { Bike, CheckCircle2, Clock3, FlameKindling } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GerentePage() {
  const session = await safeGetSessionFromCookies();

  let stats: Array<{ status: string; _count: { _all: number } }> = [];
  let ultimos: Array<{ id: string; numero: number; status: string; createdAt: Date }> = [];
  let erroPedidos: string | null = null;

  try {
    if (!prisma) {
      erroPedidos = 'Banco não configurado';
      ultimos = [];
    } else {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const grouped = await (prisma.pedido.groupBy as any)({
        by: ['status'],
        _count: { _all: true },
        where: { createdAt: { gte: hoje } }
      });

      stats = grouped as Array<{ status: string; _count: { _all: number } }>;

      ultimos = await prisma.pedido.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, numero: true, status: true, createdAt: true }
      });
    }
  } catch (error) {
    console.error('Erro ao carregar dados do gerente:', error);
    stats = [];
    ultimos = [];
    erroPedidos = 'Sem pedidos hoje';
  }

  const totais = stats.reduce(
    (acc, item) => ({ ...acc, [item.status]: item._count._all }),
    { CONFIRMADO: 0, PREPARANDO: 0, PRONTO: 0, EM_ENTREGA: 0 } as Record<string, number>
  );

  const kpis = [
    { title: 'Confirmados', value: totais.CONFIRMADO ?? 0, subtitle: 'Novos pedidos', icon: CheckCircle2, accent: 'green' as const },
    { title: 'Preparando', value: totais.PREPARANDO ?? 0, subtitle: 'Na cozinha', icon: FlameKindling, accent: 'amber' as const },
    { title: 'Prontos', value: totais.PRONTO ?? 0, subtitle: 'Aguardando retirada', icon: Clock3, accent: 'cyan' as const },
    { title: 'Em entrega', value: totais.EM_ENTREGA ?? 0, subtitle: 'Em rota', icon: Bike, accent: 'pink' as const }
  ];

  return (
    <main className="manager-page mx-auto max-w-6xl space-y-8 px-6 py-8">
      <GerenteNav />
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Dashboard do Gerente</p>
        <h1 className="text-4xl font-black leading-tight text-[color:var(--text-primary)]">Olá, {session?.role ?? 'Gerente'}</h1>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(kpi => (
          <NeonCard
            key={kpi.title}
            title={kpi.title}
            subtitle={kpi.subtitle}
            value={kpi.value}
            icon={kpi.icon}
            accent={kpi.accent}
          />
        ))}
      </section>

      <StepsWidget />

      <SectionCard title="Últimos pedidos" subtitle="Fila do dia">
        <div className="overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-card)]">
          <table className="min-w-full divide-y divide-[var(--border-soft)] text-sm">
            <thead className="bg-[color:var(--pill)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-primary)]">#</th>
                <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-primary)]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[color:var(--text-primary)]">Horário</th>
              </tr>
            </thead>
            <tbody>
              {ultimos?.map(pedido => (
                <tr key={pedido.id} className="border-b border-[var(--border-soft)] hover:bg-[color:var(--pill)]">
                  <td className="px-4 py-3">
                    <Link href={`/gerente/pedidos/${pedido.id}`} className="font-semibold text-[color:var(--text-primary)] hover:text-[color:var(--text-muted)]">
                      #{pedido.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-primary)]">{pedido.status}</td>
                  <td className="px-4 py-3 text-[color:var(--text-muted)]">
                    {new Date(pedido.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
              {(!ultimos || ultimos.length === 0) && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-[color:var(--text-muted)]">
                    {erroPedidos ?? 'Sem pedidos recentes.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </main>
  );
}
