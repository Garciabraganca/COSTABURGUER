import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const totalUsuarios = await prisma.usuario.count();

    return NextResponse.json({ needsBootstrap: totalUsuarios === 0 });
  } catch (error) {
    console.error('Erro ao verificar bootstrap admin:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar bootstrap' },
      { status: 500 }
    );
  }
}
