"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import KitchenTheater from '@/components/KitchenTheater';
import { useOrder } from '@/context/OrderContext';

// Ingredientes de exemplo para demonstração
const ingredientesDemo = [
  'pao-brioche',
  'carne-angus',
  'queijo-cheddar',
  'bacon',
  'alface',
  'tomate',
  'molho-especial',
];

const extrasDemo = ['batata', 'refri-lata'];

function AcompanharContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido') || 'DEMO';
  const { cart, extrasSelecionados } = useOrder();
  const [isComplete, setIsComplete] = useState(false);
  const [showDemo, setShowDemo] = useState(true);

  // Extrai ingredientes do carrinho ou usa demo
  const ingredientes = cart.length > 0
    ? cart[0].ingredientes || ingredientesDemo
    : ingredientesDemo;

  const extras = extrasSelecionados.length > 0
    ? extrasSelecionados
    : extrasDemo;

  const handleComplete = () => {
    setIsComplete(true);
  };

  return (
    <div className="acompanhamento-page">
      <h2>Acompanhe seu Pedido</h2>
      <p className="step-subtitle">
        Veja seu lanche sendo preparado em tempo real
      </p>

      {showDemo && (
        <div className="demo-notice" style={{
          background: 'rgba(249, 196, 107, 0.2)',
          border: '1px solid var(--accent-gold)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.85rem',
        }}>
          <strong>Modo demonstração:</strong> Os vídeos serão simulados até você adicionar os arquivos reais.
          <button
            onClick={() => setShowDemo(false)}
            style={{
              marginLeft: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'var(--primary-red)',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Entendi
          </button>
        </div>
      )}

      <KitchenTheater
        ingredientes={ingredientes}
        extras={extras}
        pedidoId={pedidoId}
        onComplete={handleComplete}
        autoPlay={true}
      />

      {isComplete && (
        <div className="acompanhamento-complete" style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          padding: '1.5rem',
          background: 'var(--white)',
          borderRadius: '16px',
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Pedido Pronto!</h3>
          <p style={{ marginBottom: '1rem', opacity: 0.8 }}>
            Seu pedido está a caminho. Tempo estimado: 15-20 min
          </p>
          <Link href={`/pedido/${pedidoId}`} className="btn primary">
            Ver detalhes do pedido
          </Link>
        </div>
      )}

      <div className="acompanhamento-info">
        <h3>🍔 Ingredientes do seu burger</h3>
        <div className="ingredientes-lista">
          {ingredientes.map((ing) => (
            <span key={ing} className="ingrediente-tag">
              {ing.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}
            </span>
          ))}
        </div>
      </div>

      {extras.length > 0 && (
        <div className="acompanhamento-info">
          <h3>🍟 Extras</h3>
          <div className="ingredientes-lista">
            {extras.map((extra) => (
              <span key={extra} className="ingrediente-tag">
                {extra.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="navigation-row">
        <Link href="/sacola" className="btn ghost">
          Voltar
        </Link>
        <Link href="/" className="btn primary">
          Novo pedido
        </Link>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="acompanhamento-page" style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍔</div>
      <p>Carregando experiência...</p>
    </div>
  );
}

export default function AcompanharPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AcompanharContent />
    </Suspense>
  );
}
