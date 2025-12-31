import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendPushToMany, PushPayload } from '@/lib/webPush';
import pushStore from '@/lib/pushStore';

// GET /api/admin/alertas/estoque - Lista alertas de estoque baixo
export async function GET(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    // Busca alertas ativos
    const alertas = await prisma.alertaEstoque.findMany({
      where: { status: 'ATIVO' },
      orderBy: { createdAt: 'desc' }
    });

    // Busca ingredientes e filtra os com estoque baixo
    const todosIngredientes = await prisma.ingrediente.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        estoque: true,
        estoqueMinimo: true,
        unidade: true,
        categoria: { select: { nome: true } }
      }
    });
    const ingredientesBaixos = todosIngredientes.filter(
      ing => ing.estoque < ing.estoqueMinimo
    );

    // Busca acompanhamentos e filtra os com estoque baixo
    const todosAcompanhamentos = await prisma.acompanhamento.findMany({
      where: { ativo: true },
      select: {
        id: true,
        nome: true,
        estoque: true,
        estoqueMinimo: true,
        unidade: true
      }
    });
    const acompanhamentosBaixos = todosAcompanhamentos.filter(
      ac => ac.estoque < ac.estoqueMinimo
    );

    // Formata os itens com estoque baixo
    const itensEstoqueBaixo = [
      ...ingredientesBaixos.map(ing => ({
        tipo: 'ingrediente' as const,
        id: ing.id,
        nome: ing.nome,
        categoria: ing.categoria?.nome,
        estoque: ing.estoque,
        estoqueMinimo: ing.estoqueMinimo,
        unidade: ing.unidade,
        faltando: ing.estoqueMinimo - ing.estoque
      })),
      ...acompanhamentosBaixos.map(ac => ({
        tipo: 'acompanhamento' as const,
        id: ac.id,
        nome: ac.nome,
        categoria: 'Acompanhamento',
        estoque: ac.estoque,
        estoqueMinimo: ac.estoqueMinimo,
        unidade: ac.unidade,
        faltando: ac.estoqueMinimo - ac.estoque
      }))
    ].sort((a, b) => b.faltando - a.faltando);

    return NextResponse.json({
      ok: true,
      alertas,
      itensEstoqueBaixo,
      resumo: {
        totalAlertas: alertas.length,
        ingredientesBaixos: ingredientesBaixos.length,
        acompanhamentosBaixos: acompanhamentosBaixos.length,
        totalItens: itensEstoqueBaixo.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar alertas de estoque:', error);
    return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 });
  }
}

// POST /api/admin/alertas/estoque - Verifica e cria alertas + envia notificações
export async function POST(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const novosAlertas: Array<{
      tipo: string;
      id: string;
      nome: string;
      estoque: number;
      estoqueMinimo: number;
    }> = [];

    // Verifica ingredientes
    const ingredientes = await prisma.ingrediente.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, estoque: true, estoqueMinimo: true }
    });

    for (const ing of ingredientes) {
      if (ing.estoque < ing.estoqueMinimo) {
        // Verifica se já existe alerta ativo
        const alertaExistente = await prisma.alertaEstoque.findUnique({
          where: {
            tipoItem_itemId_status: {
              tipoItem: 'ingrediente',
              itemId: ing.id,
              status: 'ATIVO'
            }
          }
        });

        if (!alertaExistente) {
          await prisma.alertaEstoque.create({
            data: {
              tipoItem: 'ingrediente',
              itemId: ing.id,
              itemNome: ing.nome,
              estoqueAtual: ing.estoque,
              estoqueMinimo: ing.estoqueMinimo,
              status: 'ATIVO'
            }
          });
          novosAlertas.push({
            tipo: 'ingrediente',
            id: ing.id,
            nome: ing.nome,
            estoque: ing.estoque,
            estoqueMinimo: ing.estoqueMinimo
          });
        }
      } else {
        // Resolve alerta se estoque foi reabastecido
        await prisma.alertaEstoque.updateMany({
          where: {
            tipoItem: 'ingrediente',
            itemId: ing.id,
            status: 'ATIVO'
          },
          data: {
            status: 'RESOLVIDO',
            resolvidoEm: new Date()
          }
        });
      }
    }

    // Verifica acompanhamentos
    const acompanhamentos = await prisma.acompanhamento.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, estoque: true, estoqueMinimo: true }
    });

    for (const ac of acompanhamentos) {
      if (ac.estoque < ac.estoqueMinimo) {
        const alertaExistente = await prisma.alertaEstoque.findUnique({
          where: {
            tipoItem_itemId_status: {
              tipoItem: 'acompanhamento',
              itemId: ac.id,
              status: 'ATIVO'
            }
          }
        });

        if (!alertaExistente) {
          await prisma.alertaEstoque.create({
            data: {
              tipoItem: 'acompanhamento',
              itemId: ac.id,
              itemNome: ac.nome,
              estoqueAtual: ac.estoque,
              estoqueMinimo: ac.estoqueMinimo,
              status: 'ATIVO'
            }
          });
          novosAlertas.push({
            tipo: 'acompanhamento',
            id: ac.id,
            nome: ac.nome,
            estoque: ac.estoque,
            estoqueMinimo: ac.estoqueMinimo
          });
        }
      } else {
        await prisma.alertaEstoque.updateMany({
          where: {
            tipoItem: 'acompanhamento',
            itemId: ac.id,
            status: 'ATIVO'
          },
          data: {
            status: 'RESOLVIDO',
            resolvidoEm: new Date()
          }
        });
      }
    }

    // Envia notificações se houver novos alertas
    let notificacoesEnviadas = 0;
    if (novosAlertas.length > 0) {
      const subscriptions = pushStore.getAllSubscriptions();
      if (subscriptions.length > 0) {
        const itensLista = novosAlertas.slice(0, 3).map(a => a.nome).join(', ');
        const payload: PushPayload = {
          title: `Alerta de Estoque Baixo`,
          body: `${novosAlertas.length} item(ns) com estoque baixo: ${itensLista}${novosAlertas.length > 3 ? '...' : ''}`,
          icon: '/logo-kraft.svg',
          tag: 'alerta-estoque',
          url: '/admin/estoque',
          requireInteraction: true,
          data: { type: 'alerta-estoque', count: novosAlertas.length }
        };

        const result = await sendPushToMany(subscriptions, payload);
        notificacoesEnviadas = result.sent;

        // Marca alertas como notificados
        for (const alerta of novosAlertas) {
          await prisma.alertaEstoque.updateMany({
            where: {
              tipoItem: alerta.tipo,
              itemId: alerta.id,
              status: 'ATIVO'
            },
            data: {
              notificado: true,
              notificadoEm: new Date()
            }
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      novosAlertas: novosAlertas.length,
      alertas: novosAlertas,
      notificacoesEnviadas,
      message: novosAlertas.length > 0
        ? `${novosAlertas.length} novo(s) alerta(s) de estoque criado(s)`
        : 'Nenhum novo alerta de estoque'
    });
  } catch (error) {
    console.error('Erro ao verificar estoque:', error);
    return NextResponse.json({ error: 'Erro ao verificar estoque' }, { status: 500 });
  }
}

// PATCH /api/admin/alertas/estoque - Atualiza status de alertas
export async function PATCH(request: Request) {
  const auth = await requireRole(request, ['ADMIN', 'GERENTE']);
  if (auth.ok === false) return auth.response;

  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { alertaId, status } = body;

    if (!alertaId || !status) {
      return NextResponse.json({ error: 'alertaId e status são obrigatórios' }, { status: 400 });
    }

    if (!['ATIVO', 'RESOLVIDO', 'IGNORADO'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const alerta = await prisma.alertaEstoque.update({
      where: { id: alertaId },
      data: {
        status,
        resolvidoEm: status !== 'ATIVO' ? new Date() : null
      }
    });

    return NextResponse.json({ ok: true, alerta });
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error);
    return NextResponse.json({ error: 'Erro ao atualizar alerta' }, { status: 500 });
  }
}
