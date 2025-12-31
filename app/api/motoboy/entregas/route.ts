import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

// GET /api/motoboy/entregas - Lista entregas do motoboy
export async function GET(request: Request) {
  const auth = await requireRole(request, ['MOTOBOY', 'ADMIN', 'GERENTE']);
  if (!auth.ok) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const periodo = searchParams.get('periodo') || 'hoje';

    // Calcula datas para filtro
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
      default:
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    }

    const where: Record<string, unknown> = {
      createdAt: { gte: dataInicio }
    };

    if (status) {
      where.status = status;
    }

    const entregas = await prisma.entrega.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pedido: {
          select: {
            id: true,
            numero: true,
            nome: true,
            celular: true,
            endereco: true,
            total: true,
            formaPagamento: true,
            statusPagamento: true,
            observacoes: true
          }
        }
      }
    });

    // Estatísticas
    const stats = {
      total: entregas.length,
      aguardando: entregas.filter(e => e.status === 'AGUARDANDO').length,
      aCaminho: entregas.filter(e => e.status === 'A_CAMINHO').length,
      entregues: entregas.filter(e => e.status === 'ENTREGUE').length,
      tempoMedioMinutos: 0
    };

    // Calcula tempo médio de entrega
    const entregasFinalizadas = entregas.filter(e => e.finalizadoEm && e.iniciadoEm);
    if (entregasFinalizadas.length > 0) {
      const tempoTotal = entregasFinalizadas.reduce((acc, e) => {
        const inicio = new Date(e.iniciadoEm!).getTime();
        const fim = new Date(e.finalizadoEm!).getTime();
        return acc + (fim - inicio);
      }, 0);
      stats.tempoMedioMinutos = Math.round(tempoTotal / entregasFinalizadas.length / 60000);
    }

    return NextResponse.json({
      ok: true,
      entregas,
      stats,
      periodo
    });
  } catch (error) {
    console.error('Erro ao listar entregas:', error);
    return NextResponse.json({ error: 'Erro ao listar entregas' }, { status: 500 });
  }
}
