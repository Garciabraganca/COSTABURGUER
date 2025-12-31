"use client";

import { useState, useEffect } from 'react';
import SummaryBox from '@/components/SummaryBox';
import { useOrder } from '@/context/OrderContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationPrompt from '@/components/NotificationPrompt';
import usePushNotifications from '@/hooks/usePushNotifications';
import { SectionCard } from '@/components/widgets/SectionCard';

type PaymentMethod = 'mercadopago' | 'pix_manual' | 'dinheiro' | 'cartao_maquina';

interface MpConfig {
  enabled: boolean;
  publicKey: string;
}

export default function PagamentoPage() {
  const { cart, extras, buildOrderPayload, currencyFormat, resetAfterOrder, customer } = useOrder();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSubscribed, subscription } = usePushNotifications();
  const [mpConfig, setMpConfig] = useState<MpConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');

  // Verifica se MP está configurado
  useEffect(() => {
    async function checkMpConfig() {
      try {
        const res = await fetch('/api/pagamento/config');
        const data = await res.json();
        setMpConfig(data);
        // Se MP não está habilitado, seleciona outro método
        if (!data.enabled) {
          setPaymentMethod('pix_manual');
        }
      } catch {
        setMpConfig({ enabled: false, publicKey: '' });
        setPaymentMethod('pix_manual');
      }
    }
    checkMpConfig();
  }, []);

  // Valida payload antes do pagamento
  function validatePayload() {
    const payload = buildOrderPayload();

    const enderecoLimpo = payload.endereco
      ?.split(',')
      .map((parte) => parte.trim())
      .filter(Boolean)
      .join(', ');

    const payloadNormalizado = {
      ...payload,
      nome: payload.nome?.trim(),
      celular: payload.celular?.trim(),
      endereco: enderecoLimpo,
    };

    const camposFaltantes = [
      !payloadNormalizado.nome && 'nome',
      !payloadNormalizado.celular && 'celular',
      !payloadNormalizado.endereco && 'endereço',
      !payloadNormalizado.tipoEntrega && 'tipo de entrega',
      cart.length === 0 && 'itens na sacola',
    ].filter(Boolean) as string[];

    if (camposFaltantes.length) {
      throw new Error(`Preencha ${camposFaltantes.join(', ')} antes de finalizar o pagamento.`);
    }

    return payloadNormalizado;
  }

  // Cria pedido no banco
  async function criarPedido(payloadNormalizado: ReturnType<typeof validatePayload>) {
    const payloadWithSubscription = {
      ...payloadNormalizado,
      pushEndpoint: subscription?.endpoint,
      formaPagamento: paymentMethod === 'mercadopago' ? 'MERCADO_PAGO' : paymentMethod.toUpperCase(),
      statusPagamento: paymentMethod === 'mercadopago' ? 'AGUARDANDO_PAGAMENTO' : 'PENDENTE',
    };

    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadWithSubscription),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || 'Não foi possível criar o pedido.');
    }

    return data.pedidoId || data.id;
  }

  // Pagamento via Mercado Pago (Checkout Pro)
  async function handleMercadoPago() {
    setLoading(true);
    setError(null);

    try {
      const payloadNormalizado = validatePayload();
      const pedidoId = await criarPedido(payloadNormalizado);

      // Cria preferência de pagamento no MP
      const prefResponse = await fetch('/api/pagamento/criar-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedidoId }),
      });

      const prefData = await prefResponse.json();

      if (!prefResponse.ok) {
        throw new Error(prefData?.error || 'Erro ao criar pagamento');
      }

      // Redireciona para o checkout do Mercado Pago
      // Em ambiente de teste, usa sandbox_init_point
      const checkoutUrl = prefData.sandboxInitPoint || prefData.initPoint;

      if (checkoutUrl) {
        resetAfterOrder();
        window.location.href = checkoutUrl;
      } else {
        throw new Error('URL de pagamento não disponível');
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  // Pagamento manual (PIX, dinheiro, maquininha)
  async function handleManualPayment() {
    setLoading(true);
    setError(null);

    try {
      const payloadNormalizado = validatePayload();
      const pedidoId = await criarPedido(payloadNormalizado);

      resetAfterOrder();

      // Redireciona para página do pedido
      if (isSubscribed) {
        router.push(`/acompanhar?pedido=${pedidoId}`);
      } else {
        router.push(`/pedido/${pedidoId}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Handler principal de pagamento
  async function handlePayment() {
    if (paymentMethod === 'mercadopago') {
      await handleMercadoPago();
    } else {
      await handleManualPayment();
    }
  }

  const paymentMethods = [
    {
      id: 'mercadopago' as const,
      name: 'Mercado Pago',
      description: 'PIX, Cartão de Crédito/Débito',
      icon: '💳',
      enabled: mpConfig?.enabled ?? false,
    },
    {
      id: 'pix_manual' as const,
      name: 'PIX (na entrega)',
      description: 'Pague via PIX ao receber',
      icon: '📱',
      enabled: true,
    },
    {
      id: 'dinheiro' as const,
      name: 'Dinheiro',
      description: 'Pague em dinheiro na entrega',
      icon: '💵',
      enabled: true,
    },
    {
      id: 'cartao_maquina' as const,
      name: 'Cartão (maquininha)',
      description: 'Débito ou crédito na entrega',
      icon: '💳',
      enabled: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Pagamento</p>
          <h2 className="text-3xl font-black sm:text-4xl">Finalize seu pedido</h2>
        </header>

        <NotificationPrompt
          variant="card"
          onSubscribed={() => {
            console.log('[Pagamento] Notificações ativadas!');
          }}
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Resumo do pedido */}
          <div className="space-y-4">
            <SectionCard title="Resumo do pedido" subtitle="Ingredientes e valores" className="bg-white/5">
              <ul className="space-y-3 text-sm text-white/80">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <div>
                      <p className="font-semibold text-white">{item.nome}</p>
                      <p className="text-xs text-white/60">
                        {Object.values(item.camadas)
                          .map((c) => c.nome)
                          .join(' • ')}
                      </p>
                      <p className="text-xs text-white/50">{item.quantidade}x {currencyFormat(item.precoUnitario)}</p>
                    </div>
                    <span className="font-semibold text-emerald-200">{currencyFormat(item.precoTotal)}</span>
                  </li>
                ))}

                {/* Extras/Acompanhamentos */}
                {extras.length > 0 && (
                  <>
                    <li className="border-t border-white/10 pt-2">
                      <p className="text-xs uppercase tracking-wide text-white/40">Acompanhamentos</p>
                    </li>
                    {extras.map((extra) => (
                      <li key={extra.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <div>
                          <p className="font-semibold text-white">{extra.nome}</p>
                          <p className="text-xs text-white/50">1x {currencyFormat(extra.preco)}</p>
                        </div>
                        <span className="font-semibold text-emerald-200">{currencyFormat(extra.preco)}</span>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </SectionCard>

            {/* Forma de pagamento */}
            <SectionCard title="Forma de pagamento" subtitle="Escolha como pagar" className="bg-white/5">
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => method.enabled && setPaymentMethod(method.id)}
                    disabled={!method.enabled}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                      paymentMethod === method.id
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : method.enabled
                        ? 'border-white/10 bg-white/5 hover:border-white/20'
                        : 'cursor-not-allowed border-white/5 bg-white/5 opacity-50'
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold text-white">{method.name}</p>
                      <p className="text-xs text-white/60">{method.description}</p>
                      {!method.enabled && method.id === 'mercadopago' && (
                        <p className="text-xs text-amber-400">Em breve</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Totais e botão */}
          <div className="space-y-4">
            {/* Dados de entrega */}
            {customer.nome && (
              <SectionCard title="Entrega" subtitle="Dados de envio" className="bg-white/5">
                <div className="space-y-1 text-sm text-white/80">
                  <p><span className="text-white/50">Nome:</span> {customer.nome}</p>
                  <p><span className="text-white/50">Celular:</span> {customer.celular}</p>
                  <p><span className="text-white/50">Endereço:</span> {[customer.rua, customer.bairro, customer.complemento].filter(Boolean).join(', ')}</p>
                  <p><span className="text-white/50">Tipo:</span> {customer.tipoEntrega === 'ENTREGA' ? 'Delivery' : 'Retirada'}</p>
                </div>
              </SectionCard>
            )}

            <SectionCard title="Totais" subtitle="Checagem final" className="bg-white/5">
              <SummaryBox />
              {error && <p className="mt-2 text-sm text-red-200">{error}</p>}
            </SectionCard>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Link
                href="/entrega"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Voltar
              </Link>
              <button
                className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  loading || cart.length === 0
                    ? 'cursor-not-allowed bg-white/10 text-white/50'
                    : 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02]'
                }`}
                onClick={handlePayment}
                disabled={loading || cart.length === 0}
              >
                {loading ? (
                  'Processando...'
                ) : paymentMethod === 'mercadopago' ? (
                  <>
                    <span className="mr-2">💳</span> Ir para Pagamento
                  </>
                ) : (
                  'Finalizar Pedido'
                )}
              </button>
            </div>

            {paymentMethod !== 'mercadopago' && (
              <p className="text-center text-xs text-white/50">
                Pagamento será realizado na {customer?.tipoEntrega === 'RETIRADA' ? 'retirada' : 'entrega'}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
