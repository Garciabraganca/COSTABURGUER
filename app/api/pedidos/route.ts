import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/memoryStore";
import { NextResponse } from "next/server";
import pushStore from "@/lib/pushStore";
import { notifyPedidoStatus } from "@/lib/notifyPedido";
import { toPrismaJson } from "@/lib/json";

// Tipos para os itens do pedido
interface BurgerItemPayload {
  nome: string;
  preco: number;
  ingredientes?: string[]; // IDs dos ingredientes usados
  selecionados?: string[]; // Alias para ingredientes
  camadas?: Record<string, { id: string; nome: string; preco: number }>;
}

interface AcompanhamentoPayload {
  id: string;
  quantidade?: number;
}

interface OrderPayload {
  nome: string;
  celular: string;
  endereco: string;
  tipoEntrega: string;
  total: number;
  subtotal?: number;
  taxaEntrega?: number;
  desconto?: number;
  itens: BurgerItemPayload[];
  extras?: AcompanhamentoPayload[];
  acompanhamentos?: AcompanhamentoPayload[];
  observacoes?: string;
  pushEndpoint?: string;
}

export async function GET() {
  if (!prisma) {
    return NextResponse.json(Array.from(memoryStore.values()));
  }

  const pedidos = await prisma.pedido.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      burgers: {
        include: {
          ingredientes: {
            include: {
              ingrediente: {
                select: { id: true, slug: true, nome: true }
              }
            }
          }
        }
      },
      acompanhamentos: {
        include: {
          acompanhamento: {
            select: { id: true, slug: true, nome: true }
          }
        }
      }
    }
  });
  return NextResponse.json(pedidos);
}

export async function POST(req: Request) {
  const data: OrderPayload = await req.json();
  const { pushEndpoint, ...orderData } = data;

  let pedido;

  if (!prisma) {
    // Demo mode - store in memory (sem cálculo de custos)
    const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    pedido = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nome: orderData.nome,
      celular: orderData.celular,
      endereco: orderData.endereco,
      tipoEntrega: orderData.tipoEntrega,
      total: orderData.total,
      itens: orderData.itens,
      status: "CONFIRMADO"
    };
    memoryStore.set(id, pedido);
  } else {
    // Modo com banco de dados - calcula custos e atualiza estoque
    pedido = await criarPedidoComCustos(orderData);
  }

  // Vincula a subscription do cliente ao pedido (para notificações futuras)
  if (pushEndpoint) {
    pushStore.linkToPedido(pushEndpoint, pedido.id);
    console.log(`[Pedido ${pedido.id}] Subscription vinculada: ${pushEndpoint.slice(-20)}...`);
  }

  // Envia notificação de confirmação
  try {
    const result = await notifyPedidoStatus(pedido.id, "CONFIRMADO");
    console.log(`[Pedido ${pedido.id}] Notificação de confirmação enviada: ${result.sent} dispositivo(s)`);
  } catch (error) {
    console.error(`[Pedido ${pedido.id}] Erro ao enviar notificação de confirmação:`, error);
  }

  return NextResponse.json(pedido, { status: 201 });
}

// Função para criar pedido com cálculo de custos e atualização de estoque
async function criarPedidoComCustos(orderData: Omit<OrderPayload, 'pushEndpoint'>) {
  // Coletar todos os IDs de ingredientes e acompanhamentos usados
  const ingredienteSlugs = new Set<string>();
  const acompanhamentoSlugs = new Set<string>();

  // Extrair slugs dos burgers
  for (const burger of orderData.itens || []) {
    const ingredientesIds = burger.ingredientes || burger.selecionados || [];
    for (const id of ingredientesIds) {
      ingredienteSlugs.add(id);
    }
  }

  // Extrair slugs dos acompanhamentos
  const acompanhamentosPayload = orderData.extras || orderData.acompanhamentos || [];
  for (const ac of acompanhamentosPayload) {
    acompanhamentoSlugs.add(ac.id);
  }

  // Buscar ingredientes do banco (por slug)
  const ingredientesDB = ingredienteSlugs.size > 0
    ? await prisma!.ingrediente.findMany({
        where: { slug: { in: Array.from(ingredienteSlugs) } }
      })
    : [];

  // Buscar acompanhamentos do banco (por slug)
  const acompanhamentosDB = acompanhamentoSlugs.size > 0
    ? await prisma!.acompanhamento.findMany({
        where: { slug: { in: Array.from(acompanhamentoSlugs) } }
      })
    : [];

  // Mapear para acesso rápido
  const ingredienteMap = new Map<string, (typeof ingredientesDB)[number]>(
    ingredientesDB.map(i => [i.slug, i])
  );
  const acompanhamentoMap = new Map<string, (typeof acompanhamentosDB)[number]>(
    acompanhamentosDB.map(a => [a.slug, a])
  );

  // Calcular custos
  let custoTotalBurgers = 0;
  let custoTotalAcompanhamentos = 0;

  // Preparar dados dos burgers com custos
  const burgersData = (orderData.itens || []).map((burger, index) => {
    const ingredientesIds = burger.ingredientes || burger.selecionados || [];
    let custoBurger = 0;

    const ingredientesRelacao = ingredientesIds
      .map(slug => {
        const ing = ingredienteMap.get(slug);
        if (ing) {
          custoBurger += ing.custo;
          return {
            ingredienteId: ing.id,
            quantidade: 1,
            precoUnitario: ing.preco,
            custoUnitario: ing.custo
          };
        }
        return null;
      })
      .filter(Boolean);

    custoTotalBurgers += custoBurger;

    return {
      nome: burger.nome || `Burger ${index + 1}`,
      preco: burger.preco,
      custo: custoBurger,
      quantidade: 1,
      ingredientes: {
        create: ingredientesRelacao
      }
    };
  });

  // Preparar dados dos acompanhamentos com custos
  const acompanhamentosData = acompanhamentosPayload.map(ac => {
    const acompDB = acompanhamentoMap.get(ac.id);
    const quantidade = ac.quantidade || 1;

    if (acompDB) {
      custoTotalAcompanhamentos += acompDB.custo * quantidade;
      return {
        acompanhamentoId: acompDB.id,
        quantidade,
        precoUnitario: acompDB.preco,
        custoUnitario: acompDB.custo
      };
    }
    return null;
  }).filter(Boolean);

  const custoTotal = custoTotalBurgers + custoTotalAcompanhamentos;
  const subtotal = orderData.subtotal || orderData.total;
  const taxaEntrega = orderData.taxaEntrega || 0;
  const desconto = orderData.desconto || 0;
  const total = orderData.total;
  const lucro = total - custoTotal;

  // Criar pedido em transação (inclui atualização de estoque)
  const pedido = await prisma!.$transaction(async (tx) => {
    // 1. Criar o pedido
    const novoPedido = await tx.pedido.create({
      data: {
        nome: orderData.nome,
        celular: orderData.celular,
        endereco: orderData.endereco,
        tipoEntrega: orderData.tipoEntrega,
        subtotal,
        taxaEntrega,
        desconto,
        total,
        custoTotal,
        lucro,
        observacoes: orderData.observacoes || null,
        itens: toPrismaJson(orderData.itens), // Mantém JSON para compatibilidade
        status: "CONFIRMADO",
        burgers: {
          create: burgersData
        },
        acompanhamentos: {
          create: acompanhamentosData as Array<{
            acompanhamentoId: string;
            quantidade: number;
            precoUnitario: number;
            custoUnitario: number;
          }>
        }
      },
      include: {
        burgers: {
          include: {
            ingredientes: true
          }
        },
        acompanhamentos: true
      }
    });

    // 2. Decrementar estoque dos ingredientes
    for (const burger of orderData.itens || []) {
      const ingredientesIds = burger.ingredientes || burger.selecionados || [];
      for (const slug of ingredientesIds) {
        const ing = ingredienteMap.get(slug);
        if (ing) {
          const estoqueAnterior = ing.estoque;
          const novoEstoque = Math.max(0, estoqueAnterior - 1);

          await tx.ingrediente.update({
            where: { id: ing.id },
            data: { estoque: novoEstoque }
          });

          // Registrar movimentação
          await tx.movimentacaoEstoque.create({
            data: {
              tipoItem: 'ingrediente',
              itemId: ing.id,
              tipo: 'saida',
              quantidade: -1,
              estoqueAnterior,
              estoqueAtual: novoEstoque,
              pedidoId: novoPedido.id,
              motivo: `Pedido #${novoPedido.numero || novoPedido.id}`
            }
          });

          // Atualizar no map para próximas iterações
          ing.estoque = novoEstoque;
        }
      }
    }

    // 3. Decrementar estoque dos acompanhamentos
    for (const ac of acompanhamentosPayload) {
      const acompDB = acompanhamentoMap.get(ac.id);
      if (acompDB) {
        const quantidade = ac.quantidade || 1;
        const estoqueAnterior = acompDB.estoque;
        const novoEstoque = Math.max(0, estoqueAnterior - quantidade);

        await tx.acompanhamento.update({
          where: { id: acompDB.id },
          data: { estoque: novoEstoque }
        });

        // Registrar movimentação
        await tx.movimentacaoEstoque.create({
          data: {
            tipoItem: 'acompanhamento',
            itemId: acompDB.id,
            tipo: 'saida',
            quantidade: -quantidade,
            estoqueAnterior,
            estoqueAtual: novoEstoque,
            pedidoId: novoPedido.id,
            motivo: `Pedido #${novoPedido.numero || novoPedido.id}`
          }
        });

        // Atualizar no map para próximas iterações
        acompDB.estoque = novoEstoque;
      }
    }

    return novoPedido;
  });

  return pedido;
}
