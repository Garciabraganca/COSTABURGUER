"use client";

import { useMemo, useState } from 'react';
import SpriteImage from './SpriteImage';
import {
  Ingredient,
  IngredientCategory,
  CATEGORIAS,
  getIngredientePorId,
  getIngredientesPorCategoria,
  calcularPrecoTotal,
} from '@/lib/ingredientsData';

const CATEGORY_FLOW: IngredientCategory[] = [
  'pao',
  'carne',
  'queijo',
  'molho',
  'vegetal',
  'extra',
  'especial',
];

type Props = {
  onBurgerComplete: (ingredientes: string[], preco: number) => void;
  currencyFormat: (value: number) => string;
};

type CategoryModalProps = {
  isOpen: boolean;
  category: IngredientCategory;
  onClose: () => void;
  onSelect: (ingredientId: string) => void;
  currencyFormat: (value: number) => string;
};

function CategoryModal({ isOpen, category, onClose, onSelect, currencyFormat }: CategoryModalProps) {
  if (!isOpen) return null;

  const ingredientes = getIngredientesPorCategoria(category);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <p className="eyebrow">Categoria</p>
            <h3>{CATEGORIAS[category].label}</h3>
            <p className="step-subtitle">Escolha um ingrediente para continuar</p>
          </div>
          <button className="btn ghost small" onClick={onClose} aria-label="Fechar modal">
            Pular etapa
          </button>
        </div>

        <div className="modal-grid">
          {ingredientes.map((ing) => (
            <button
              key={ing.id}
              className="modal-ingredient-card"
              onClick={() => onSelect(ing.id)}
            >
              <SpriteImage
                sheet={ing.sheet}
                x={ing.x}
                y={ing.y}
                width={ing.width}
                height={ing.height}
                scale={0.42}
                ariaLabel={ing.name}
              />
              <div className="modal-ingredient-info">
                <span>{ing.name}</span>
                <small>
                  {ing.price > 0 ? `+ ${currencyFormat(ing.price)}` : 'Incluso'}
                </small>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BurgerStack({ items, lastAddedId }: { items: Ingredient[]; lastAddedId?: string }) {
  const ordered = useMemo(
    () => [...items].sort((a, b) => a.order - b.order),
    [items]
  );

  return (
    <div className="stack-viewport">
      {ordered
        .slice()
        .reverse()
        .map((ingredient) => (
          <div
            key={`${ingredient.id}-${ingredient.order}-${ingredient.x}`}
            className={`stack-layer ${lastAddedId === ingredient.id ? 'spin-once' : ''}`.trim()}
          >
            <SpriteImage
              sheet={ingredient.sheet}
              x={ingredient.x}
              y={ingredient.y}
              width={ingredient.width}
              height={ingredient.height}
              scale={0.5}
              ariaLabel={ingredient.name}
            />
            <span className="stack-label">{ingredient.name}</span>
          </div>
        ))}
    </div>
  );
}

export default function BurgerBuilder({ onBurgerComplete, currencyFormat }: Props) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | undefined>();

  const totalPrice = useMemo(
    () => calcularPrecoTotal(selectedIngredients),
    [selectedIngredients]
  );

  const sortedIngredients = useMemo(
    () =>
      selectedIngredients
        .map((id) => getIngredientePorId(id))
        .filter((ing): ing is Ingredient => !!ing),
    [selectedIngredients]
  );

  const startFlow = () => {
    setHasStarted(true);
    setActiveCategoryIndex(0);
  };

  const goToNextCategory = () => {
    setActiveCategoryIndex((prev) => {
      if (prev === null) return null;
      if (prev >= CATEGORY_FLOW.length - 1) return null;
      return prev + 1;
    });
  };

  const handleSelectIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => [...prev, ingredientId]);
    setLastAddedId(ingredientId);
    goToNextCategory();
  };

  const handleFinish = () => {
    if (selectedIngredients.length === 0) {
      alert('Adicione pelo menos um ingrediente antes de finalizar.');
      return;
    }

    onBurgerComplete(selectedIngredients, totalPrice);
    setSelectedIngredients([]);
    setLastAddedId(undefined);
    setHasStarted(false);
    setActiveCategoryIndex(null);
  };

  const clearAll = () => {
    setSelectedIngredients([]);
    setLastAddedId(undefined);
  };

  const handleOpenNext = () => {
    if (activeCategoryIndex === null) {
      setActiveCategoryIndex(0);
      return;
    }
    goToNextCategory();
  };

  const activeCategory =
    activeCategoryIndex !== null ? CATEGORY_FLOW[activeCategoryIndex] : null;

  return (
    <div className="flow-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Boas-vindas</p>
          <h2>Olá, tudo bem?</h2>
          <p className="step-subtitle">
            Monte seu hambúrguer peça por peça e veja o resultado ganhar vida.
          </p>
        </div>
        <button className="btn primary" onClick={startFlow}>
          Monte seu hambúrguer!
        </button>
      </section>

      <section className="builder-live-area">
        <div className="builder-preview">
          <header className="builder-preview__header">
            <div>
              <p className="eyebrow">Hambúrguer em construção</p>
              <h3>Camadas em tempo real</h3>
            </div>
            <div className="price-pill">{currencyFormat(totalPrice)}</div>
          </header>

          <BurgerStack items={sortedIngredients} lastAddedId={lastAddedId} />

          <div className="preview-actions">
            <button
              className="btn ghost small"
              onClick={clearAll}
              disabled={selectedIngredients.length === 0}
            >
              Limpar tudo
            </button>
            <button
              className="btn primary"
              onClick={handleFinish}
              disabled={selectedIngredients.length === 0}
            >
              Adicionar à sacola
            </button>
          </div>
        </div>

        <div className="builder-flow">
          <header className="builder-flow__header">
            <p className="eyebrow">Passo a passo</p>
            <h3>Escolha por categoria</h3>
            <p className="step-subtitle">
              Cada toque abre um modal com o catálogo real recortado das sprites.
            </p>
          </header>

          <div className="category-list">
            {CATEGORY_FLOW.map((category, index) => {
              const isActive = activeCategoryIndex === index;
              const hasSelection = selectedIngredients.some(
                (id) => getIngredientePorId(id)?.category === category
              );

              return (
                <button
                  key={category}
                  className={`category-row ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setHasStarted(true);
                    setActiveCategoryIndex(index);
                  }}
                >
                  <div className="category-dot" style={{ backgroundColor: CATEGORIAS[category].cor }} />
                  <div className="category-copy">
                    <strong>{CATEGORIAS[category].label}</strong>
                    <span className="step-subtitle">
                      {hasSelection ? 'Selecionado' : 'Toque para abrir'}
                    </span>
                  </div>
                  <span className="category-chevron">→</span>
                </button>
              );
            })}
          </div>

          <div className="flow-footer">
            <button
              className="btn ghost small"
              onClick={handleOpenNext}
              disabled={!hasStarted}
            >
              Próxima categoria
            </button>
            <button
              className="btn secondary"
              onClick={handleFinish}
              disabled={selectedIngredients.length === 0}
            >
              Finalizar montagem
            </button>
          </div>
        </div>
      </section>

      {activeCategory && (
        <CategoryModal
          isOpen={activeCategoryIndex !== null}
          category={activeCategory}
          onClose={goToNextCategory}
          onSelect={handleSelectIngredient}
          currencyFormat={currencyFormat}
        />
      )}
    </div>
  );
}
