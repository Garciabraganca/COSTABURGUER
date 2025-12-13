import { prisma } from '@/lib/prisma';

// GET /api/cozinha/stream - Stream SSE de pedidos em tempo real para a cozinha
export async function GET() {
  if (!prisma) {
    return new Response('Banco de dados não configurado', { status: 503 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: Record<string, unknown>) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // Heartbeat para manter conexão
      const heartbeatInterval = setInterval(() => {
        sendEvent('heartbeat', { timestamp: new Date().toISOString() });
      }, 30000);

      // Estado anterior para comparação
      let pedidosAnteriores: Map<string, string> = new Map();
      let isRunning = true;

      const checkPedidos = async () => {
        if (!isRunning) return;

        try {
          const pedidos = await prisma!.pedido.findMany({
            where: {
              status: {
                in: ['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'EM_ENTREGA']
              }
            },
            orderBy: { createdAt: 'asc' },
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
              },
              entrega: {
                select: {
                  id: true,
                  token: true,
                  status: true,
                  motoboyNome: true,
                  latitudeAtual: true,
                  longitudeAtual: true
                }
              }
            }
          });

          const pedidosAtuais = new Map<string, string>();
          const novosPedidos: typeof pedidos = [];
          const pedidosAlterados: typeof pedidos = [];

          for (const pedido of pedidos) {
            const chave = `${pedido.id}-${pedido.status}-${pedido.updatedAt.toISOString()}`;
            pedidosAtuais.set(pedido.id, chave);

            if (!pedidosAnteriores.has(pedido.id)) {
              novosPedidos.push(pedido);
            } else if (pedidosAnteriores.get(pedido.id) !== chave) {
              pedidosAlterados.push(pedido);
            }
          }

          // Pedidos removidos (finalizados ou cancelados)
          const pedidosRemovidos: string[] = [];
          for (const [id] of pedidosAnteriores) {
            if (!pedidosAtuais.has(id)) {
              pedidosRemovidos.push(id);
            }
          }

          // Enviar eventos
          if (novosPedidos.length > 0) {
            sendEvent('novos_pedidos', { pedidos: novosPedidos });
          }

          if (pedidosAlterados.length > 0) {
            sendEvent('pedidos_atualizados', { pedidos: pedidosAlterados });
          }

          if (pedidosRemovidos.length > 0) {
            sendEvent('pedidos_removidos', { ids: pedidosRemovidos });
          }

          // Estatísticas
          const stats = {
            confirmados: pedidos.filter(p => p.status === 'CONFIRMADO').length,
            preparando: pedidos.filter(p => p.status === 'PREPARANDO').length,
            prontos: pedidos.filter(p => p.status === 'PRONTO').length,
            emEntrega: pedidos.filter(p => p.status === 'EM_ENTREGA').length,
            total: pedidos.length
          };

          // Se houver mudanças, enviar estatísticas atualizadas
          if (novosPedidos.length > 0 || pedidosAlterados.length > 0 || pedidosRemovidos.length > 0) {
            sendEvent('stats', stats);
          }

          pedidosAnteriores = pedidosAtuais;

          // Próxima verificação
          if (isRunning) {
            setTimeout(checkPedidos, 2000);
          }
        } catch (error) {
          console.error('Erro no stream da cozinha:', error);
          if (isRunning) {
            setTimeout(checkPedidos, 5000);
          }
        }
      };

      // Enviar estado inicial
      const pedidosIniciais = await prisma!.pedido.findMany({
        where: {
          status: {
            in: ['CONFIRMADO', 'PREPARANDO', 'PRONTO', 'EM_ENTREGA']
          }
        },
        orderBy: { createdAt: 'asc' },
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
          },
          entrega: {
            select: {
              id: true,
              token: true,
              status: true,
              motoboyNome: true
            }
          }
        }
      });

      for (const pedido of pedidosIniciais) {
        pedidosAnteriores.set(pedido.id, `${pedido.id}-${pedido.status}-${pedido.updatedAt.toISOString()}`);
      }

      sendEvent('connected', {
        message: 'Stream da cozinha iniciado',
        pedidos: pedidosIniciais,
        stats: {
          confirmados: pedidosIniciais.filter(p => p.status === 'CONFIRMADO').length,
          preparando: pedidosIniciais.filter(p => p.status === 'PREPARANDO').length,
          prontos: pedidosIniciais.filter(p => p.status === 'PRONTO').length,
          emEntrega: pedidosIniciais.filter(p => p.status === 'EM_ENTREGA').length,
          total: pedidosIniciais.length
        }
      });

      // Iniciar polling
      setTimeout(checkPedidos, 2000);
    },
    cancel() {
      console.log('[SSE] Stream da cozinha cancelado');
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}
