import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verificarJwt } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado. Defina DATABASE_URL no ambiente.' },
        { status: 503 }
      );
    }

    const token = cookies().get('token')?.value;
    const payload = token ? await verificarJwt(token) : null;

    if (!payload) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar autenticação' },
      { status: 500 }
    );
  }
}
