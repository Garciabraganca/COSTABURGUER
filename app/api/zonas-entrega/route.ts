import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/zonas-entrega - Lista zonas ativas (público)
export async function GET() {
  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const zonas = await prisma.zonaEntrega.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
      select: {
        id: true,
        nome: true,
        descricao: true,
        tipo: true,
        bairros: true,
        distanciaMin: true,
        distanciaMax: true,
        taxaEntrega: true,
        tempoEstimado: true
      }
    });

    return NextResponse.json({ ok: true, zonas });
  } catch (error) {
    console.error('Erro ao listar zonas:', error);
    return NextResponse.json({ error: 'Erro ao listar zonas' }, { status: 500 });
  }
}

// POST /api/zonas-entrega - Calcula taxa de entrega
export async function POST(request: Request) {
  if (!prisma) {
    return NextResponse.json({ error: 'Banco de dados não configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { bairro, cep, latitude, longitude, latitudeOrigem, longitudeOrigem } = body;

    const zonas = await prisma.zonaEntrega.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' }
    });

    // Tenta encontrar zona por bairro
    if (bairro) {
      const bairroNormalizado = bairro.toLowerCase().trim();
      const zonaEncontrada = zonas.find(z =>
        z.tipo === 'bairro' &&
        z.bairros.some(b => b.toLowerCase().trim() === bairroNormalizado)
      );

      if (zonaEncontrada) {
        return NextResponse.json({
          ok: true,
          zona: {
            id: zonaEncontrada.id,
            nome: zonaEncontrada.nome,
            taxaEntrega: zonaEncontrada.taxaEntrega,
            tempoEstimado: zonaEncontrada.tempoEstimado
          }
        });
      }
    }

    // Tenta encontrar zona por CEP
    if (cep) {
      const cepNumerico = cep.replace(/\D/g, '');
      const zonaEncontrada = zonas.find(z => {
        if (z.tipo !== 'cep' || !z.cepInicio || !z.cepFim) return false;
        const cepInicioNum = z.cepInicio.replace(/\D/g, '');
        const cepFimNum = z.cepFim.replace(/\D/g, '');
        return cepNumerico >= cepInicioNum && cepNumerico <= cepFimNum;
      });

      if (zonaEncontrada) {
        return NextResponse.json({
          ok: true,
          zona: {
            id: zonaEncontrada.id,
            nome: zonaEncontrada.nome,
            taxaEntrega: zonaEncontrada.taxaEntrega,
            tempoEstimado: zonaEncontrada.tempoEstimado
          }
        });
      }
    }

    // Tenta encontrar zona por distância
    if (latitude && longitude && latitudeOrigem && longitudeOrigem) {
      const distancia = calcularDistancia(
        latitudeOrigem,
        longitudeOrigem,
        latitude,
        longitude
      );

      const zonaEncontrada = zonas.find(z => {
        if (z.tipo !== 'distancia') return false;
        const min = z.distanciaMin || 0;
        const max = z.distanciaMax || Infinity;
        return distancia >= min && distancia <= max;
      });

      if (zonaEncontrada) {
        return NextResponse.json({
          ok: true,
          zona: {
            id: zonaEncontrada.id,
            nome: zonaEncontrada.nome,
            taxaEntrega: zonaEncontrada.taxaEntrega,
            tempoEstimado: zonaEncontrada.tempoEstimado
          },
          distanciaCalculada: Math.round(distancia * 100) / 100
        });
      }
    }

    // Busca taxa padrão na configuração
    const configTaxa = await prisma.configuracao.findUnique({
      where: { chave: 'taxa_entrega' }
    });

    return NextResponse.json({
      ok: true,
      zona: null,
      taxaPadrao: configTaxa ? Number(configTaxa.valor) : 0,
      message: 'Nenhuma zona específica encontrada, usando taxa padrão'
    });
  } catch (error) {
    console.error('Erro ao calcular taxa:', error);
    return NextResponse.json({ error: 'Erro ao calcular taxa' }, { status: 500 });
  }
}

// Calcula distância entre dois pontos usando fórmula de Haversine
function calcularDistancia(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
