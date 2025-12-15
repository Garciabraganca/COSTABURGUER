import { MotoboyNav } from '@/components/MotoboyNav';
import { DeliveryWidget } from '@/components/widgets/DeliveryWidget';
import { SectionCard } from '@/components/widgets/SectionCard';
import { safeGetSessionFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function MotoboyDashboard() {
  const session = await safeGetSessionFromCookies();

  let entregas: Array<{
    id: string;
    status: string;
    token: string;
    pedidoId: number | string | null;
    latitudeAtual: number | null;
    longitudeAtual: number | null;
    ultimaAtualizacao: Date | null;
  }> = [];
  let erro: string | null = null;

  try {
    if (!prisma) {
      erro = 'Banco não configurado';
    } else {
      entregas = await prisma.entrega.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          status: true,
          token: true,
          pedidoId: true,
          latitudeAtual: true,
          longitudeAtual: true,
          ultimaAtualizacao: true
        }
      });
    }
  } catch (error) {
    console.error('Erro ao carregar entregas:', error);
    entregas = [];
    erro = 'Nenhuma entrega disponível agora';
  }

  const entregaAtiva = entregas.find(
    entrega => entrega.status !== 'ENTREGUE' && entrega.status !== 'CANCELADA'
  );

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-8 text-white">
      <MotoboyNav />
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">Painel do Motoboy</p>
        <h1 className="text-4xl font-black leading-tight">Bem-vindo, {session?.role ?? 'MOTOBOY'}</h1>
        {erro && <span className="text-sm text-white/70">{erro}</span>}
      </header>

      <SectionCard title="Entrega ativa" subtitle="Acompanhe sua rota" className="bg-white/5">
        <DeliveryWidget
          entrega={
            entregaAtiva
              ? {
                  pedidoId: entregaAtiva.pedidoId,
                  status: entregaAtiva.status,
                  eta: entregaAtiva.ultimaAtualizacao
                    ? new Date(entregaAtiva.ultimaAtualizacao).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : null,
                  motoboy: 'Você'
                }
              : undefined
          }
        />
      </SectionCard>

      <SectionCard title="Histórico recente" subtitle="Últimas 20 entregas" className="bg-white/5">
        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-white/5">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Pedido</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Última atualização</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {entregas.map(entrega => (
                <tr key={entrega.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">#{entrega.pedidoId ?? '—'}</td>
                  <td className="px-4 py-3 text-white/80">{entrega.status}</td>
                  <td className="px-4 py-3 text-white/70">
                    {entrega.ultimaAtualizacao
                      ? new Date(entrega.ultimaAtualizacao).toLocaleString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/entrega/${entrega.token}`} className="text-pink-200 hover:text-white">
                      Abrir rastreio
                    </Link>
                  </td>
                </tr>
              ))}
              {entregas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-white/60">
                    Nenhuma entrega atribuída.
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
