import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/delivery/[token]/stream - Stream SSE de localização em tempo real
export async function GET(_request: Request, { params }: RouteParams) {
  const { token } = await params;

  if (!prisma) {
    return new Response('Banco de dados não configurado', { status: 503 });
  }

  // Verificar se a entrega existe
  const entrega = await prisma.entrega.findUnique({
    where: { token },
    select: { id: true, status: true }
  });

  if (!entrega) {
    return new Response('Entrega não encontrada', { status: 404 });
  }

  // Criar stream SSE
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Enviar evento inicial
      const sendEvent = (data: Record<string, unknown>) => {
        const message = `data: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Enviar heartbeat para manter conexão
      const heartbeatInterval = setInterval(() => {
        sendEvent({ type: 'heartbeat', timestamp: new Date().toISOString() });
      }, 30000);

      // Polling de localização (a cada 3 segundos)
      let lastUpdate: Date | null = null;
      let isRunning = true;

      const checkLocation = async () => {
        if (!isRunning) return;

        try {
          const entregaAtual = await prisma!.entrega.findUnique({
            where: { token },
            select: {
              status: true,
              latitudeAtual: true,
              longitudeAtual: true,
              ultimaAtualizacao: true,
              pedido: {
                select: {
                  status: true,
                  latitude: true,
                  longitude: true
                }
              }
            }
          });

          if (!entregaAtual) {
            sendEvent({ type: 'error', message: 'Entrega não encontrada' });
            isRunning = false;
            return;
          }

          // Verificar se houve atualização
          const temNovaLocalizacao = entregaAtual.ultimaAtualizacao &&
            (!lastUpdate || entregaAtual.ultimaAtualizacao > lastUpdate);

          if (temNovaLocalizacao) {
            lastUpdate = entregaAtual.ultimaAtualizacao;

            sendEvent({
              type: 'location',
              data: {
                latitude: entregaAtual.latitudeAtual,
                longitude: entregaAtual.longitudeAtual,
                timestamp: entregaAtual.ultimaAtualizacao?.toISOString(),
                status: entregaAtual.status,
                destino: entregaAtual.pedido.latitude && entregaAtual.pedido.longitude ? {
                  latitude: entregaAtual.pedido.latitude,
                  longitude: entregaAtual.pedido.longitude
                } : null
              }
            });
          }

          // Verificar se a entrega foi finalizada
          if (entregaAtual.status === 'ENTREGUE' || entregaAtual.pedido.status === 'ENTREGUE') {
            sendEvent({
              type: 'completed',
              message: 'Entrega finalizada',
              status: 'ENTREGUE'
            });
            isRunning = false;
            clearInterval(heartbeatInterval);
            controller.close();
            return;
          }

          // Agendar próxima verificação
          if (isRunning) {
            setTimeout(checkLocation, 3000);
          }
        } catch (error) {
          console.error('Erro no stream de localização:', error);
          if (isRunning) {
            setTimeout(checkLocation, 5000);
          }
        }
      };

      // Iniciar verificação
      sendEvent({ type: 'connected', message: 'Stream iniciado' });
      checkLocation();

      // Cleanup quando o cliente desconectar
      // Nota: O cleanup real acontece quando a conexão é fechada pelo cliente
    },
    cancel() {
      // Stream cancelado pelo cliente
      console.log(`[SSE] Stream cancelado para token: ${token}`);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no' // Para Nginx
    }
  });
}
