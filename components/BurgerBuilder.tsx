"use client";

import { useMemo, useState, useEffect } from 'react';
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

const CATEGORY_ICONS: Record<IngredientCategory, string> = {
  pao: '🍞',
  carne: '🥩',
  queijo: '🧀',
  molho: '🥫',
  vegetal: '🥬',
  extra: '🥓',
  especial: '✨',
};

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
      <div className="modal-card modal-card-premium">
        <div className="modal-header-premium">
          <div className="modal-title-area">
            <span className="category-icon-large">{CATEGORY_ICONS[category]}</span>
            <div>
              <p className="eyebrow-gold">Selecione seu ingrediente</p>
              <h3 className="modal-title">{CATEGORIAS[category].label}</h3>
            </div>
          </div>
          <button className="btn-skip" onClick={onClose}>
            Pular <span className="skip-arrow">→</span>
          </button>
        </div>

        <div className="modal-grid-premium">
          {ingredientes.map((ing) => (
            <button
              key={ing.id}
              className="ingredient-card-premium"
              onClick={() => onSelect(ing.id)}
            >
              <div className="ingredient-image-wrapper">
                <div className="ingredient-glow"></div>
                <SpriteImage
                  sheet={ing.sheet}
                  x={ing.x}
                  y={ing.y}
                  width={ing.width}
                  height={ing.height}
                  scale={0.5}
                  ariaLabel={ing.name}
                />
              </div>
              <div className="ingredient-details">
                <span className="ingredient-name-premium">{ing.name}</span>
                <span className={`ingredient-price-tag ${ing.price === 0 ? 'free' : ''}`}>
                  {ing.price > 0 ? `+ ${currencyFormat(ing.price)}` : 'Incluso'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Burger3DPreview({ items, isSpinning }: { items: Ingredient[]; isSpinning: boolean }) {
  const ordered = useMemo(
    () => [...items].sort((a, b) => a.order - b.order),
    [items]
  );

  // Calculate layer positions for stacking effect
  const getLayerStyle = (index: number, total: number) => {
    const baseBottom = 10;
    const layerHeight = total > 1 ? Math.min(45, 180 / total) : 50;
    return {
      bottom: `${baseBottom + index * layerHeight}px`,
      zIndex: index + 1,
      animationDelay: `${index * 0.1}s`,
    };
  };

  return (
    <div className={`burger-3d-container ${isSpinning ? 'spinning' : ''}`}>
      <div className="burger-platform">
        <div className="platform-shadow"></div>
      </div>

      <div className="burger-3d-wrapper">
        <div className="burger-3d">
          {ordered.length === 0 ? (
            <div className="empty-burger-hint">
              <div className="hint-icon">🍔</div>
              <p>Seu hambúrguer aparecerá aqui</p>
              <span>Selecione os ingredientes para começar</span>
            </div>
          ) : (
            ordered.map((ingredient, index) => (
              <div
                key={`${ingredient.id}-${index}`}
                className="burger-3d-layer"
                style={getLayerStyle(index, ordered.length)}
              >
                <div className="layer-content">
                  <SpriteImage
                    sheet={ingredient.sheet}
                    x={ingredient.x}
                    y={ingredient.y}
                    width={ingredient.width}
                    height={ingredient.height}
                    scale={0.65}
                    ariaLabel={ingredient.name}
                  />
                </div>
                <div className="layer-shadow"></div>
              </div>
            ))
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="burger-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{ '--delay': `${i * 0.3}s` } as React.CSSProperties}></div>
          ))}
        </div>
      )}
    </div>
  );
}

function IngredientsList({
  selectedIds,
  onRemove
}: {
  selectedIds: string[];
  onRemove: (index: number) => void;
}) {
  const ingredients = selectedIds
    .map(id => getIngredientePorId(id))
    .filter((ing): ing is Ingredient => !!ing);

  if (ingredients.length === 0) {
    return (
      <div className="ingredients-list-empty">
        <span>Nenhum ingrediente adicionado</span>
      </div>
    );
  }

  return (
    <div className="ingredients-list">
      {ingredients.map((ing, index) => (
        <div key={`${ing.id}-${index}`} className="ingredient-chip">
          <span className="chip-icon">{CATEGORY_ICONS[ing.category]}</span>
          <span className="chip-name">{ing.name}</span>
          <button
            className="chip-remove"
            onClick={() => onRemove(index)}
            aria-label={`Remover ${ing.name}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function BurgerBuilder({ onBurgerComplete, currencyFormat }: Props) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // Animate on ingredient add
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [selectedIngredients.length]);

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
    goToNextCategory();
  };

  const handleRemoveIngredient = (index: number) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = () => {
    if (selectedIngredients.length === 0) {
      alert('Adicione pelo menos um ingrediente antes de finalizar.');
      return;
    }

    onBurgerComplete(selectedIngredients, totalPrice);
    setSelectedIngredients([]);
    setHasStarted(false);
    setActiveCategoryIndex(null);
  };

  const clearAll = () => {
    setSelectedIngredients([]);
  };

  const activeCategory =
    activeCategoryIndex !== null ? CATEGORY_FLOW[activeCategoryIndex] : null;

  return (
    <div className="builder-premium">
      {/* Hero Section */}
      <section className="builder-hero">
        <div className="hero-content">
          <div className="hero-badge">Monte do seu jeito</div>
          <h1 className="hero-title">Crie seu Hambúrguer</h1>
          <p className="hero-subtitle">
            Escolha cada ingrediente e veja seu hambúrguer ganhar vida em tempo real
          </p>
          {!hasStarted && (
            <button className="btn-start-building" onClick={startFlow}>
              <span className="btn-icon">🍔</span>
              Começar a Montar
              <span className="btn-shine"></span>
            </button>
          )}
        </div>
        <div className="hero-decoration">
          <div className="deco-circle circle-1"></div>
          <div className="deco-circle circle-2"></div>
          <div className="deco-circle circle-3"></div>
        </div>
      </section>

      {/* Main Builder Area */}
      <section className="builder-main">
        {/* 3D Burger Preview */}
        <div className="preview-panel">
          <div className="preview-header">
            <div className="preview-title">
              <span className="preview-icon">👀</span>
              <span>Visualização em Tempo Real</span>
            </div>
            <div className="price-display">
              <span className="price-label">Total</span>
              <span className="price-value">{currencyFormat(totalPrice)}</span>
            </div>
          </div>

          <Burger3DPreview
            items={sortedIngredients}
            isSpinning={sortedIngredients.length > 0}
          />

          <div className="preview-ingredients">
            <IngredientsList
              selectedIds={selectedIngredients}
              onRemove={handleRemoveIngredient}
            />
          </div>

          <div className="preview-actions">
            <button
              className="btn-ghost"
              onClick={clearAll}
              disabled={selectedIngredients.length === 0}
            >
              Limpar Tudo
            </button>
            <button
              className="btn-primary-premium"
              onClick={handleFinish}
              disabled={selectedIngredients.length === 0}
            >
              <span>Adicionar à Sacola</span>
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="categories-panel">
          <div className="categories-header">
            <h2>Escolha os Ingredientes</h2>
            <p>Toque em uma categoria para adicionar</p>
          </div>

          <div className="categories-grid">
            {CATEGORY_FLOW.map((category, index) => {
              const isActive = activeCategoryIndex === index;
              const count = selectedIngredients.filter(
                (id) => getIngredientePorId(id)?.category === category
              ).length;

              return (
                <button
                  key={category}
                  className={`category-card ${isActive ? 'active' : ''} ${count > 0 ? 'has-items' : ''}`}
                  onClick={() => {
                    setHasStarted(true);
                    setActiveCategoryIndex(index);
                  }}
                  style={{ '--category-color': CATEGORIAS[category].cor } as React.CSSProperties}
                >
                  <div className="category-icon">{CATEGORY_ICONS[category]}</div>
                  <div className="category-info">
                    <span className="category-name">{CATEGORIAS[category].label}</span>
                    {count > 0 && (
                      <span className="category-count">{count} item{count > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div className="category-indicator">
                    {count > 0 ? '✓' : '+'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="categories-footer">
            <button
              className="btn-secondary"
              onClick={handleFinish}
              disabled={selectedIngredients.length === 0}
            >
              Finalizar Montagem
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
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
