import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET /api/motoboy/estatisticas - Estatísticas do motoboy
export async function GET(request: Request) {
  const auth = await requireRole(request, ['MOTOBOY', 'ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || 'mes';

    const agora = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case 'hoje':
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        break;
      case 'semana':
        dataInicio = new Date(agora);
        dataInicio.setDate(dataInicio.getDate() - 7);
        break;
      case 'mes':
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
        break;
      case 'ano':
        dataInicio = new Date(agora.getFullYear(), 0, 1);
        break;
      default:
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    }

    // Busca todas as entregas do período
    const entregas = await prisma.entrega.findMany({
      where: {
        createdAt: { gte: dataInicio }
      },
      include: {
        pedido: {
          select: {
            total: true,
            taxaEntrega: true
          }
        }
      }
    });

    // Calcula estatísticas
    const totalEntregas = entregas.length;
    const entregasFinalizadas = entregas.filter(e => e.status === 'ENTREGUE');
    const entregasCanceladas = entregas.filter(e => e.status === 'CANCELADO');

    // Taxa de sucesso
    const taxaSucesso = totalEntregas > 0
      ? Math.round((entregasFinalizadas.length / totalEntregas) * 100)
      : 0;

    // Tempo médio de entrega
    let tempoMedioMinutos = 0;
    const entregasComTempo = entregasFinalizadas.filter(e => e.finalizadoEm && e.iniciadoEm);
    if (entregasComTempo.length > 0) {
      const tempoTotal = entregasComTempo.reduce((acc, e) => {
        const inicio = new Date(e.iniciadoEm!).getTime();
        const fim = new Date(e.finalizadoEm!).getTime();
        return acc + (fim - inicio);
      }, 0);
      tempoMedioMinutos = Math.round(tempoTotal / entregasComTempo.length / 60000);
    }

    // Total de taxas de entrega
    const totalTaxasEntrega = entregasFinalizadas.reduce(
      (acc, e) => acc + (e.pedido?.taxaEntrega || 0),
      0
    );

    // Entregas por dia da semana
    const entregasPorDia: Record<string, number> = {
      'Domingo': 0,
      'Segunda': 0,
      'Terça': 0,
      'Quarta': 0,
      'Quinta': 0,
      'Sexta': 0,
      'Sábado': 0
    };

    const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    entregasFinalizadas.forEach(e => {
      const dia = diasSemana[new Date(e.createdAt).getDay()];
      entregasPorDia[dia]++;
    });

    // Entregas por hora do dia
    const entregasPorHora: Record<number, number> = {};
    for (let h = 10; h <= 23; h++) {
      entregasPorHora[h] = 0;
    }

    entregasFinalizadas.forEach(e => {
      const hora = new Date(e.createdAt).getHours();
      if (entregasPorHora[hora] !== undefined) {
        entregasPorHora[hora]++;
      }
    });

    // Ranking de horários mais movimentados
    const horariosPico = Object.entries(entregasPorHora)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hora, count]) => ({ hora: `${hora}:00`, entregas: count }));

    return NextResponse.json({
      ok: true,
      periodo,
      estatisticas: {
        totalEntregas,
        entregasFinalizadas: entregasFinalizadas.length,
        entregasCanceladas: entregasCanceladas.length,
        taxaSucesso,
        tempoMedioMinutos,
        totalTaxasEntrega: Math.round(totalTaxasEntrega * 100) / 100,
        mediaDiaria: Math.round(entregasFinalizadas.length / getDiasPeriodo(dataInicio, agora) * 10) / 10
      },
      distribuicao: {
        porDia: entregasPorDia,
        porHora: entregasPorHora,
        horariosPico
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}

function getDiasPeriodo(inicio: Date, fim: Date): number {
  const diff = fim.getTime() - inicio.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
