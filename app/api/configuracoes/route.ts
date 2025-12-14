import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/configuracoes - Listar todas as configurações
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const configuracoes = await prisma.configuracao.findMany({
      orderBy: { chave: 'asc' }
    });

    // Converter para objeto key-value
    const configObj: Record<string, unknown> = {};
    for (const config of configuracoes) {
      let valor: unknown = config.valor;

      // Parse do valor baseado no tipo
      switch (config.tipo) {
        case 'number':
          valor = parseFloat(config.valor);
          break;
        case 'boolean':
          valor = config.valor === 'true';
          break;
        case 'json':
          try {
            valor = JSON.parse(config.valor);
          } catch {
            valor = config.valor;
          }
          break;
      }

      configObj[config.chave] = valor;
    }

    return NextResponse.json({
      configuracoes,
      valores: configObj
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

// POST /api/configuracoes - Criar ou atualizar configuração
export async function POST(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { chave, valor, tipo, descricao } = body;

    // Validação
    if (!chave || valor === undefined) {
      return NextResponse.json(
        { error: 'Chave e valor são obrigatórios' },
        { status: 400 }
      );
    }

    // Converter valor para string
    const valorString = typeof valor === 'object' ? JSON.stringify(valor) : String(valor);

    // Upsert - cria ou atualiza
    const configuracao = await prisma.configuracao.upsert({
      where: { chave },
      update: {
        valor: valorString,
        ...(tipo && { tipo }),
        ...(descricao !== undefined && { descricao })
      },
      create: {
        chave,
        valor: valorString,
        tipo: tipo || (typeof valor === 'object' ? 'json' : typeof valor),
        descricao: descricao || null
      }
    });

    return NextResponse.json(configuracao);
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar configuração' },
      { status: 500 }
    );
  }
}

// DELETE /api/configuracoes - Deletar configuração
export async function DELETE(request: Request) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chave = searchParams.get('chave');

    if (!chave) {
      return NextResponse.json(
        { error: 'Chave é obrigatória' },
        { status: 400 }
      );
    }

    await prisma.configuracao.delete({
      where: { chave }
    });

    return NextResponse.json({ message: 'Configuração removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar configuração:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar configuração' },
      { status: 500 }
    );
  }
}
