import { prisma } from '../../../lib/prisma';

const memoryStore = globalThis.__orders || { list: [] };
globalThis.__orders = memoryStore;

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end('Method not allowed');
  }

  const { latitude, longitude } = req.body;

  try {
    if (process.env.DATABASE_URL) {
      const updated = await prisma.entrega.update({
        where: { pedidoId: Number(id) },
        data: { latitude, longitude },
      });
      return res.status(200).json(updated);
    }
  } catch (error) {
    console.error('Erro ao atualizar entrega', error);
  }

  const found = memoryStore.list.find((p) => String(p.id) === String(id));
  if (!found) return res.status(404).end('Pedido não encontrado');
  found.entrega = { latitude, longitude, atualizadoEm: new Date().toISOString() };
  return res.status(200).json(found.entrega);
}
