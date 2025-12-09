import { prisma } from '../../../lib/prisma';

const memoryStore = globalThis.__orders || { list: [], statusId: 1 };
globalThis.__orders = memoryStore;

function todayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

async function createWithPrisma(body) {
  const { itens = [], cliente = {}, extras = [], valores = {} } = body;
  const status = await prisma.statusPedido.upsert({
    where: { nome: 'confirmado' },
    update: {},
    create: { nome: 'confirmado' },
  });

  const pedido = await prisma.pedido.create({
    data: {
      codigo: `COSTA-${Date.now()}`,
      status: { connect: { id: status.id } },
      total: valores.total || 0,
      itens: {
        create: itens.map((item) => ({ nome: item.nome, camadas: item.camadas, preco: item.preco })),
      },
      endereco: cliente.nome
        ? {
            create: {
              nome: cliente.nome,
              celular: cliente.celular || '',
              rua: cliente.rua || '',
              bairro: cliente.bairro || '',
              complemento: cliente.complemento,
              referencia: cliente.referencia,
              tipoEntrega: cliente.tipoEntrega || 'entrega',
            },
          }
        : undefined,
      entrega: {
        create: {},
      },
    },
  });
  return { id: pedido.id, codigo: pedido.codigo, total: pedido.total, extras, valores };
}

function createInMemory(body) {
  const { itens = [], cliente = {}, extras = [], valores = {} } = body;
  const id = memoryStore.list.length + 1;
  const codigo = `COSTA-${id}`;
  const now = new Date();
  memoryStore.list.push({ id, codigo, itens, cliente, extras, valores, createdAt: now, status: 'confirmado' });
  return { id, codigo, itens, extras, valores, cliente };
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const order = process.env.DATABASE_URL ? await createWithPrisma(req.body) : createInMemory(req.body);
      return res.status(201).json(order);
    } catch (error) {
      console.error('Erro ao criar pedido', error);
      const order = createInMemory(req.body);
      return res.status(201).json(order);
    }
  }

  if (req.method === 'GET') {
    try {
      if (process.env.DATABASE_URL) {
        const { start, end } = todayRange();
        const pedidos = await prisma.pedido.findMany({
          where: { createdAt: { gte: start, lte: end } },
          include: { status: true },
        });
        return res.status(200).json(pedidos);
      }
    } catch (error) {
      console.error('Erro ao listar pedidos', error);
    }

    const { start, end } = todayRange();
    const pedidos = memoryStore.list.filter((p) => p.createdAt >= start && p.createdAt <= end);
    return res.status(200).json(pedidos);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Method not allowed');
}
