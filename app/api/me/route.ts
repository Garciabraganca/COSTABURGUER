import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verificarJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const token = cookies().get('token')?.value;
    const payload = token ? await verificarJwt(token) : null;

    if (!payload) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, ...payload });
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar autenticação' },
      { status: 500 }
    );
  }
}
