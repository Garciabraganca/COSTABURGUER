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
  extras: { id: string; nome: string; preco: number }[];
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
  const filteredExtras = extras.filter(extra => {
    if (isCombo) {
      return extra.id === 'batata' || extra.id === 'sobremesa';
    } else {
      return extra.id === 'refri-lata' || extra.id === 'refri-1l';
    }
  });

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card-premium extras-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-premium">
          <div className="modal-title-area">
            <span className="category-icon-large">{icon}</span>
            <div>
              <p className="eyebrow-gold">{subtitle}</p>
              <h3 className="modal-title">{title}</h3>
            </div>
          </div>
          <button className="btn-skip" onClick={onClose}>
            Fechar <span className="skip-arrow">×</span>
          </button>
        </div>

        <div className="modal-grid-premium extras-modal-grid">
          {filteredExtras.map((extra) => {
            const isSelected = extrasSelecionados.includes(extra.id);
            return (
              <button
                key={extra.id}
                className={`ingredient-card-premium extras-card ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleExtra(extra.id)}
              >
                <div className="extras-check">
                  {isSelected && <span className="check-icon">✓</span>}
                </div>
                <div className="ingredient-details">
                  <span className="ingredient-name-premium">{extra.nome}</span>
                  <span className={`ingredient-price-tag ${isSelected ? 'selected' : ''}`}>
                    + {currencyFormat(extra.preco)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="extras-modal-footer">
          <button className="btn-primary-premium" onClick={onClose}>
            <span>Confirmar</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExtrasChips() {
  const { extras, extrasSelecionados, toggleExtra, currencyFormat } = useOrder();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Check if any items are selected in each category
  const hasComboSelected = extrasSelecionados.some(id => id === 'batata' || id === 'sobremesa');
  const hasBebidaSelected = extrasSelecionados.some(id => id === 'refri-lata' || id === 'refri-1l');

  return (
    <>
      <div className="extras-images-container">
        <button
          className={`extras-image-card ${hasComboSelected ? 'has-selection' : ''}`}
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
          {hasComboSelected && (
            <div className="selection-badge">
              <span>✓</span>
            </div>
          )}
        </button>

        <button
          className={`extras-image-card ${hasBebidaSelected ? 'has-selection' : ''}`}
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
          {hasBebidaSelected && (
            <div className="selection-badge">
              <span>✓</span>
            </div>
          )}
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
