import { prisma } from '../../../lib/prisma';

const memoryStore = globalThis.__orders || { list: [] };
globalThis.__orders = memoryStore;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method not allowed');
  }

  const { type, data } = req.body || {};
  if (type === 'payment' && data?.status === 'approved') {
    const orderId = data.metadata?.orderId;
    try {
      if (process.env.DATABASE_URL) {
        const status = await prisma.statusPedido.upsert({
          where: { nome: 'confirmado' },
          update: {},
          create: { nome: 'confirmado' },
        });
        await prisma.pedido.update({ where: { id: Number(orderId) }, data: { statusId: status.id } });
      } else {
        const found = memoryStore.list.find((p) => String(p.id) === String(orderId));
        if (found) found.status = 'confirmado';
      }
    } catch (error) {
      console.error('Erro ao aplicar webhook', error);
    }
  }

  return res.status(200).json({ received: true });
}
