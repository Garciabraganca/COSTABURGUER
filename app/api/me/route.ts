import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { verificarJwt } from '@/lib/auth';

export async function GET() {
  try {
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
