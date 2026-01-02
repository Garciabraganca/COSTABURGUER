import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Trim and clean the access token to avoid issues with whitespace/quotes
const rawAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const accessToken = rawAccessToken?.trim().replace(/^["']|["']$/g, '');

function validateAccessToken(token: string | undefined): boolean {
  if (!token) return false;
  // Valid MP access tokens start with TEST- (sandbox) or APP_USR- (production)
  return token.startsWith('TEST-') || token.startsWith('APP_USR-');
}

if (!accessToken) {
  console.warn('MERCADOPAGO_ACCESS_TOKEN não configurado. Pagamentos desabilitados.');
} else if (!validateAccessToken(accessToken)) {
  console.error(
    'MERCADOPAGO_ACCESS_TOKEN inválido. O token deve começar com "TEST-" (sandbox) ou "APP_USR-" (produção). ' +
    'Verifique suas credenciais em https://www.mercadopago.com.br/developers/panel/app'
  );
}

const isValidToken = validateAccessToken(accessToken);

export const mercadopago = isValidToken
  ? new MercadoPagoConfig({ accessToken: accessToken! })
  : null;

export const preferenceClient = mercadopago ? new Preference(mercadopago) : null;
export const paymentClient = mercadopago ? new Payment(mercadopago) : null;

export const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';

export function isMercadoPagoEnabled(): boolean {
  return !!mercadopago;
}
