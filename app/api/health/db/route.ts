import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type DbNameRow = { db: string | null };
type PublicTablesRow = { public_tables: number };

export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco não configurado (DATABASE_URL)' },
        { status: 503 }
      );
    }

    const [dbRow] = await prisma.$queryRaw<DbNameRow[]>`select current_database() as db;`;
    const [usuariosRow] = await prisma.$queryRaw<{ usuarios_table: string | null }[]>`
      select to_regclass('public.usuarios') as usuarios_table;
    `;
    const [pedidosRow] = await prisma.$queryRaw<{ pedidos_table: string | null }[]>`
      select to_regclass('public.pedidos') as pedidos_table;
    `;
    const [publicTablesRow] =
      await prisma.$queryRaw<PublicTablesRow[]>`
        select count(*)::int as public_tables
        from information_schema.tables
        where table_schema = 'public'
          and table_type = 'BASE TABLE';
      `;

    return NextResponse.json({
      db: dbRow?.db ?? null,
      usuarios_table: usuariosRow?.usuarios_table ?? null,
      pedidos_table: pedidosRow?.pedidos_table ?? null,
      public_tables: publicTablesRow?.public_tables ?? 0
    });
  } catch (error) {
    console.error('Erro ao consultar status do banco de dados:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar status do banco de dados' },
      { status: 500 }
    );
  }
}
