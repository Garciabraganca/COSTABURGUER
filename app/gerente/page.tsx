import { cookies } from 'next/headers';
import Link from 'next/link';

import { GerenteNav } from '@/components/GerenteNav';
import { verificarJwt } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export default async function GerentePage() {
  const token = cookies().get('token')?.value;
  const payload = token ? await verificarJwt(token) : null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const stats = prisma
    ? await prisma.pedido.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { createdAt: { gte: hoje } }
      })
    : [];

  const ultimos = prisma
    ? await prisma.pedido.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, numero: true, status: true, createdAt: true }
      })
    : [];

  const totais = stats.reduce((acc, item) => ({ ...acc, [item.status]: item._count._all }), {} as Record<string, number>);

  return (
    <main style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <GerenteNav />
      <h1 style={{ marginBottom: 8 }}>Dashboard do Gerente</h1>
      <p style={{ color: '#555' }}>Sessão: <strong>{payload?.role ?? 'Gerente'}</strong></p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, margin: '16px 0' }}>
        {['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'EM_ENTREGA', 'ENTREGUE', 'CANCELADO'].map(status => (
          <div key={status} style={{ background: '#f1f5f9', padding: 16, borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: '#555' }}>{status}</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{totais[status] ?? 0}</div>
          </div>
        ))}
      </section>

      <h2>Últimos pedidos</h2>
      <div style={{ border: '1px solid #eee', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ textAlign: 'left', padding: 12 }}>#</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Status</th>
              <th style={{ textAlign: 'left', padding: 12 }}>Horário</th>
            </tr>
          </thead>
          <tbody>
            {ultimos.map(pedido => (
              <tr key={pedido.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: 12 }}>
                  <Link href={`/gerente/pedidos/${pedido.id}`} style={{ color: '#b22222' }}>
                    #{pedido.numero}
                  </Link>
                </td>
                <td style={{ padding: 12 }}>{pedido.status}</td>
                <td style={{ padding: 12 }}>{new Date(pedido.createdAt).toLocaleTimeString('pt-BR')}</td>
              </tr>
            ))}
            {ultimos.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: 12 }}>Sem pedidos recentes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
