"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useOrder } from '@/context/OrderContext';

type ModalType = 'combo' | 'bebidas' | null;

function ExtrasModal({
  type,
  onClose,
  extras,
  extrasSelecionados,
  toggleExtra,
  currencyFormat
}: {
  type: ModalType;
  onClose: () => void;
  extras: { id: string; nome: string; preco: number; imagem?: string; categoria?: string }[];
  extrasSelecionados: string[];
  toggleExtra: (id: string) => void;
  currencyFormat: (value: number) => string;
}) {
  if (!type) return null;

  const isCombo = type === 'combo';
  const title = isCombo ? 'Combo' : 'Bebidas';
  const subtitle = isCombo ? 'Escolha batata e sobremesa' : 'Escolha seu refrigerante';
  const icon = isCombo ? '🍟' : '🥤';

  // Filter extras based on modal type
  const filteredExtras = extras.filter((extra) => {
    if (isCombo) {
      return extra.categoria === 'combo' || extra.id === 'batata' || extra.id === 'sobremesa';
    }

    return extra.categoria === 'bebida';
  });

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950/80 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">{icon}</span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">{subtitle}</p>
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
          </div>
          <button className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/20" onClick={onClose}>
            Fechar <span className="text-lg">×</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          {filteredExtras.map((extra) => {
            const isSelected = extrasSelecionados.includes(extra.id);
            return (
              <button
                key={extra.id}
                className={`relative flex flex-col gap-3 overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/50 hover:bg-white/10 ${isSelected ? 'border-emerald-400/60 shadow-neon-glow' : ''}`}
                onClick={() => toggleExtra(extra.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-900/50 ring-1 ring-white/10">
                    {extra.imagem ? (
                      <Image
                        src={extra.imagem}
                        alt={extra.nome}
                        fill
                        sizes="64px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">{isCombo ? '🍟' : '🥤'}</div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-semibold leading-tight">{extra.nome}</span>
                      {isSelected && <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">Selecionado</span>}
                    </div>
                    <span className={`mt-1 inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${isSelected ? 'bg-emerald-500/20 text-emerald-100' : 'bg-white/10 text-white/80'}`}>
                      + {currencyFormat(extra.preco)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}

          {filteredExtras.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-white/70">
              Nenhum extra disponível
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">
          <button className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02]" onClick={onClose}>
            <span>Confirmar</span>
            <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExtrasChips() {
  const { extras, extrasSelecionados, toggleExtra, currencyFormat } = useOrder();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const beverageIds = extras.filter((extra) => extra.categoria === 'bebida').map((extra) => extra.id);

  // Check if any items are selected in each category
  const hasComboSelected = extrasSelecionados.some((id) => id === 'batata' || id === 'sobremesa');
  const hasBebidaSelected = extrasSelecionados.some((id) => beverageIds.includes(id));

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <button
          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-emerald-400/50 ${hasComboSelected ? 'ring-2 ring-emerald-400/60' : ''}`}
          onClick={() => setActiveModal('combo')}
        >
          <Image
            src="/combo.png"
            alt="Combo - Batata e Sobremesa"
            width={300}
            height={200}
            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Combo</p>
              <p className="text-lg font-semibold">Batata + sobremesa</p>
            </div>
            {hasComboSelected && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/40">
                ✓
              </div>
            )}
          </div>
        </button>

        <button
          className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-emerald-400/50 ${hasBebidaSelected ? 'ring-2 ring-emerald-400/60' : ''}`}
          onClick={() => setActiveModal('bebidas')}
        >
          <Image
            src="/bebidas.png"
            alt="Bebidas - Refrigerantes"
            width={300}
            height={200}
            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Bebidas</p>
              <p className="text-lg font-semibold">Refrigerantes gelados</p>
            </div>
            {hasBebidaSelected && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/40">
                ✓
              </div>
            )}
          </div>
        </button>
      </div>

      <ExtrasModal
        type={activeModal}
        onClose={() => setActiveModal(null)}
        extras={extras}
        extrasSelecionados={extrasSelecionados}
        toggleExtra={toggleExtra}
        currencyFormat={currencyFormat}
      />
    </>
  );
}
