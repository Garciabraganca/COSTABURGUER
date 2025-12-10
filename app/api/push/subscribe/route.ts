import { NextRequest, NextResponse } from 'next/server';
import pushStore from '@/lib/pushStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { endpoint, keys, pedidoId } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: 'Dados de subscription inválidos' },
        { status: 400 }
      );
    }

    // Adiciona subscription ao store
    const subscription = pushStore.addSubscription({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      pedidoId,
    });

    // Se tem pedidoId, vincula
    if (pedidoId) {
      pushStore.linkToPedido(endpoint, pedidoId);
    }

    console.log(`[API] New push subscription registered. Total: ${pushStore.count()}`);

    return NextResponse.json({
      success: true,
      message: 'Subscription registrada com sucesso',
      subscriptionId: endpoint.slice(-20),
    });
  } catch (error) {
    console.error('[API] Subscribe error:', error);
    return NextResponse.json(
      { error: 'Erro ao registrar subscription' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Retorna estatísticas (apenas para debug)
  return NextResponse.json({
    total: pushStore.count(),
    message: 'Push notification service is running',
  });
}
