import { NextRequest, NextResponse } from 'next/server';
import pushStore from '@/lib/pushStore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint é obrigatório' },
        { status: 400 }
      );
    }

    const removed = pushStore.removeSubscription(endpoint);

    if (removed) {
      console.log(`[API] Push subscription removed. Total: ${pushStore.count()}`);
      return NextResponse.json({
        success: true,
        message: 'Subscription removida com sucesso',
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Subscription não encontrada (já removida)',
      });
    }
  } catch (error) {
    console.error('[API] Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Erro ao remover subscription' },
      { status: 500 }
    );
  }
}
