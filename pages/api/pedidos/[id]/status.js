import { prisma } from '../../../../lib/prisma';

const memoryStore = globalThis.__orders || { list: [] };
globalThis.__orders = memoryStore;

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end('Method not allowed');
  }

  const { status } = req.body;

  try {
    if (process.env.DATABASE_URL) {
      const statusRow = await prisma.statusPedido.upsert({
        where: { nome: status },
        update: {},
        create: { nome: status },
      });
      const updated = await prisma.pedido.update({ where: { id: Number(id) }, data: { statusId: statusRow.id } });
      return res.status(200).json(updated);
    }
  } catch (error) {
    console.error('Erro ao atualizar status', error);
  }

  const found = memoryStore.list.find((p) => String(p.id) === String(id));
  if (!found) return res.status(404).end('Pedido não encontrado');
  found.status = status;
  return res.status(200).json(found);
}
