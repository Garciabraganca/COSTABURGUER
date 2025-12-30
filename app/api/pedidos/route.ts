import { prisma } from "@/lib/prisma";
import { memoryStore } from "@/lib/memoryStore";
import { NextResponse } from "next/server";
import pushStore from "@/lib/pushStore";
import { notifyPedidoStatus } from "@/lib/notifyPedido";
import { toPrismaJson } from "@/lib/json";

type IngredientePayload = {
  ingredienteId: string;
  quantidade?: number;
  orderIndex?: number;
};

type BurgerPayload = {
  nome?: string;
  quantidade?: number;
  ingredientes: IngredientePayload[];
};

type AcompanhamentoPayload = {
  acompanhamentoId: string;
  quantidade?: number;
};

type OrderPayload = {
  nome: string;
  celular: string;
  endereco: string;
  tipoEntrega: string;
  observacoes?: string;
  burger?: BurgerPayload;
  burgers?: BurgerPayload[];
  acompanhamentos?: AcompanhamentoPayload[];
  pushEndpoint?: string;
  formaPagamento?: string;
  statusPagamento?: string;
};

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

  if (!orderData.nome || !orderData.celular || !orderData.endereco || !orderData.tipoEntrega) {
    return NextResponse.json({ ok: false, message: "Dados obrigatórios ausentes" }, { status: 400 });
  }

  let pedido;

  if (!prisma) {
    const id = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    pedido = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nome: orderData.nome,
      celular: orderData.celular,
      endereco: orderData.endereco,
      tipoEntrega: orderData.tipoEntrega,
      total: 0,
      itens: [],
      status: "CONFIRMADO"
    };
    memoryStore.set(id, pedido);
  } else {
    pedido = await criarPedidoComCustos(orderData);
  }

  if (pushEndpoint) {
    pushStore.linkToPedido(pushEndpoint, pedido.id);
  }

  try {
    await notifyPedidoStatus(pedido.id, "CONFIRMADO");
  } catch (error) {
    console.error(`[Pedido ${pedido.id}] Erro ao enviar notificação de confirmação:`, error);
  }

  return NextResponse.json({ ok: true, pedidoId: pedido.id, numero: pedido.numero, status: pedido.status }, { status: 201 });
}

async function criarPedidoComCustos(orderData: Omit<OrderPayload, "pushEndpoint">) {
  const burgersPayload = orderData.burgers || (orderData.burger ? [orderData.burger] : []);

  if (!burgersPayload.length) {
    throw new Error("Nenhum burger informado");
  }

  const ingredientesIds = burgersPayload.flatMap(b => b.ingredientes?.map(i => i.ingredienteId) || []);
  const acompanhamentosIds = orderData.acompanhamentos?.map(a => a.acompanhamentoId) || [];

  const ingredientesDB = await prisma!.ingrediente.findMany({
    where: { id: { in: ingredientesIds } }
  });
  const acompanhamentoDB = await prisma!.acompanhamento.findMany({
    where: { id: { in: acompanhamentosIds } }
  });

  const ingredienteMap = new Map(ingredientesDB.map(i => [i.id, i]));
  const acompanhamentoMap = new Map(acompanhamentoDB.map(a => [a.id, a]));

  let subtotal = 0;
  let custoTotal = 0;

  const burgersData = burgersPayload.map((burger, idx) => {
    const quantidadeBurger = burger.quantidade ?? 1;
    let burgerPreco = 0;
    let burgerCusto = 0;

    const ingredientesRelacao = (burger.ingredientes || []).map(rel => {
      const ing = ingredienteMap.get(rel.ingredienteId) as
        | { id: string; preco: number; custo: number }
        | undefined;
      const quantidade = rel.quantidade ?? 1;
      if (!ing) return null;
      burgerPreco += ing.preco * quantidade;
      burgerCusto += ing.custo * quantidade;
      return {
        ingredienteId: ing.id,
        quantidade,
        precoUnitario: ing.preco,
        custoUnitario: ing.custo
      };
    }).filter(Boolean) as Array<{ ingredienteId: string; quantidade: number; precoUnitario: number; custoUnitario: number }>;

    subtotal += burgerPreco * quantidadeBurger;
    custoTotal += burgerCusto * quantidadeBurger;

    return {
      nome: burger.nome || `Burger ${idx + 1}`,
      preco: burgerPreco,
      custo: burgerCusto,
      quantidade: quantidadeBurger,
      ingredientes: { create: ingredientesRelacao }
    };
  });

  const acompanhamentosData = (orderData.acompanhamentos || []).map(ac => {
    const acomp = acompanhamentoMap.get(ac.acompanhamentoId) as
      | { id: string; preco: number; custo: number }
      | undefined;
    const quantidade = ac.quantidade ?? 1;
    if (!acomp) return null;
    subtotal += acomp.preco * quantidade;
    custoTotal += acomp.custo * quantidade;
    return {
      acompanhamentoId: acomp.id,
      quantidade,
      precoUnitario: acomp.preco,
      custoUnitario: acomp.custo
    };
  }).filter(Boolean) as Array<{ acompanhamentoId: string; quantidade: number; precoUnitario: number; custoUnitario: number }>;

  const taxaEntrega = orderData.tipoEntrega === "ENTREGA"
    ? await buscarTaxaEntrega()
    : 0;

  const total = subtotal + taxaEntrega;
  const lucro = total - custoTotal;

  const pedido = await prisma!.$transaction(async (tx) => {
    const novoPedido = await tx.pedido.create({
      data: {
        nome: orderData.nome,
        celular: orderData.celular,
        endereco: orderData.endereco,
        tipoEntrega: orderData.tipoEntrega,
        subtotal,
        taxaEntrega,
        desconto: 0,
        total,
        custoTotal,
        lucro,
        observacoes: orderData.observacoes || null,
        itens: toPrismaJson(orderData),
        status: "CONFIRMADO",
        formaPagamento: orderData.formaPagamento || null,
        statusPagamento: orderData.statusPagamento || "PENDENTE",
        burgers: { create: burgersData },
        acompanhamentos: { create: acompanhamentosData }
      }
    });

    for (const rel of burgersPayload) {
      for (const ingRel of rel.ingredientes || []) {
        const ing = ingredienteMap.get(ingRel.ingredienteId) as
          | { id: string; estoque: number }
          | undefined;
        if (!ing) continue;
        const quantidade = ingRel.quantidade ?? 1;
        const estoqueAnterior = ing.estoque;
        const estoqueAtual = Math.max(0, estoqueAnterior - quantidade);
        await tx.ingrediente.update({ where: { id: ing.id }, data: { estoque: estoqueAtual } });
        await tx.movimentacaoEstoque.create({
          data: {
            tipoItem: "ingrediente",
            itemId: ing.id,
            tipo: "saida",
            quantidade: -quantidade,
            estoqueAnterior,
            estoqueAtual,
            pedidoId: novoPedido.id,
            motivo: `Pedido #${novoPedido.numero}`
          }
        });
        ing.estoque = estoqueAtual;
      }
    }

    for (const ac of orderData.acompanhamentos || []) {
      const acomp = acompanhamentoMap.get(ac.acompanhamentoId) as
        | { id: string; estoque: number }
        | undefined;
      if (!acomp) continue;
      const quantidade = ac.quantidade ?? 1;
      const estoqueAnterior = acomp.estoque;
      const estoqueAtual = Math.max(0, estoqueAnterior - quantidade);
      await tx.acompanhamento.update({ where: { id: acomp.id }, data: { estoque: estoqueAtual } });
      await tx.movimentacaoEstoque.create({
        data: {
          tipoItem: "acompanhamento",
          itemId: acomp.id,
          tipo: "saida",
          quantidade: -quantidade,
          estoqueAnterior,
          estoqueAtual,
          pedidoId: novoPedido.id,
          motivo: `Pedido #${novoPedido.numero}`
        }
      });
      acomp.estoque = estoqueAtual;
    }

    return novoPedido;
  });

  return pedido;
}

async function buscarTaxaEntrega() {
  try {
    const config = await prisma!.configuracao.findUnique({ where: { chave: "taxa_entrega" } });
    return config ? Number(config.valor) : 0;
  } catch (error) {
    console.error("Erro ao buscar taxa de entrega", error);
    return 0;
  }
}
