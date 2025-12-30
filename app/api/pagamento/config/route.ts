import { NextResponse } from 'next/server';
import { isMercadoPagoEnabled, MERCADOPAGO_PUBLIC_KEY } from '@/lib/mercadopago';

export async function GET() {
  return NextResponse.json({
    enabled: isMercadoPagoEnabled(),
    publicKey: MERCADOPAGO_PUBLIC_KEY,
  });
}
