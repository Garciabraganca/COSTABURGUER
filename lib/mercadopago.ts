import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.warn('MERCADOPAGO_ACCESS_TOKEN não configurado. Pagamentos desabilitados.');
}

export const mercadopago = accessToken
  ? new MercadoPagoConfig({ accessToken })
  : null;

export const preferenceClient = mercadopago ? new Preference(mercadopago) : null;
export const paymentClient = mercadopago ? new Payment(mercadopago) : null;

export const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';

export function isMercadoPagoEnabled(): boolean {
  return !!mercadopago;
}
