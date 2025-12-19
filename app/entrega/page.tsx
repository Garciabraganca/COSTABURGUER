"use client";

import Link from 'next/link';
import { useOrder } from '@/context/OrderContext';
import { SectionCard } from '@/components/widgets/SectionCard';

export default function EntregaPage() {
  const { customer, updateCustomer } = useOrder();

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Entrega</p>
          <h2 className="text-3xl font-black sm:text-4xl">Onde vamos entregar?</h2>
          <p className="text-white/60">Preencha os dados para encontramos você rapidamente.</p>
        </header>

        <SectionCard title="Dados de contato" subtitle="Whatsapp e quem vai receber" className="bg-white/5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-white/80">
              <span>Nome completo</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={customer.nome || ''}
                onChange={(e) => updateCustomer({ nome: e.target.value })}
                placeholder="Quem vai receber?"
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Celular / WhatsApp</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={customer.celular || ''}
                onChange={(e) => updateCustomer({ celular: e.target.value })}
                placeholder="(00) 99999-0000"
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Endereço" subtitle="Rua, bairro e referências" className="bg-white/5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-white/80 sm:col-span-2">
              <span>Rua e número</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={customer.rua || ''}
                onChange={(e) => updateCustomer({ rua: e.target.value })}
                placeholder="Av. da praia, 123"
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Bairro</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={customer.bairro || ''}
                onChange={(e) => updateCustomer({ bairro: e.target.value })}
                placeholder="Centro"
              />
            </label>
            <label className="space-y-1 text-sm text-white/80">
              <span>Complemento</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={customer.complemento || ''}
                onChange={(e) => updateCustomer({ complemento: e.target.value })}
                placeholder="Bloco, apartamento..."
              />
            </label>
            <label className="space-y-1 text-sm text-white/80 sm:col-span-2">
              <span>Referência</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={customer.referencia || ''}
                onChange={(e) => updateCustomer({ referencia: e.target.value })}
                placeholder="Perto do quiosque vermelho"
              />
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Tipo de entrega" subtitle="Escolha retirar ou receber em casa" className="bg-white/5">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-emerald-400/40">
              <input
                type="radio"
                name="tipo"
                value="ENTREGA"
                className="h-4 w-4 accent-emerald-400"
                checked={customer.tipoEntrega !== 'RETIRADA'}
                onChange={(e) => updateCustomer({ tipoEntrega: e.target.value as 'ENTREGA' | 'RETIRADA' })}
              />
              Entrega em casa
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-emerald-400/40">
              <input
                type="radio"
                name="tipo"
                value="RETIRADA"
                className="h-4 w-4 accent-emerald-400"
                checked={customer.tipoEntrega === 'RETIRADA'}
                onChange={(e) => updateCustomer({ tipoEntrega: e.target.value as 'ENTREGA' | 'RETIRADA' })}
              />
              Retirada no balcão
            </label>
          </div>
        </SectionCard>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/sacola"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
          >
            Voltar para sacola
          </Link>
          <Link
            href="/pagamento"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02]"
          >
            Ir para pagamento
          </Link>
        </div>
      </div>
    </main>
  );
}
