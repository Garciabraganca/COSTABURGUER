export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method not allowed');
  }

  const { total } = req.body || {};
  const preferenceId = `pref-${Date.now()}`;

  // Aqui entrarão as chamadas reais para o SDK do Mercado Pago.
  return res.status(200).json({ preferenceId, initPoint: `https://mpago.la/${preferenceId}`, total });
}
