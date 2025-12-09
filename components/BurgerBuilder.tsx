"use client";

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import DraggableIngredient from './DraggableIngredient';
import {
  Ingredient,
  SPRITE_SHEET_SIZE,
  ingredients,
  CATEGORIAS,
  getIngredientePorId,
  calcularPrecoTotal,
} from '@/lib/ingredientsData';

type Props = {
  onBurgerComplete: (ingredientes: string[], preco: number) => void;
  currencyFormat: (value: number) => string;
};

function DropZone({ children, isOver }: { children: React.ReactNode; isOver: boolean }) {
  return (
    <div className={`burger-drop-zone ${isOver ? 'drag-over' : ''}`}>
      <div className="burger-stack">
        {children}
      </div>
      {!children || (Array.isArray(children) && children.length === 0) ? (
        <p className="drop-hint">Arraste os ingredientes aqui para montar seu burger!</p>
      ) : null}
    </div>
  );
}

function BurgerLayer({ ingredient, onRemove }: { ingredient: Ingredient; onRemove: () => void }) {
  const stackScale = 0.7;
  const layerWidth = ingredient.width * stackScale;
  const layerHeight = ingredient.height * stackScale;

  return (
    <div
      className="burger-layer-item"
      style={{
        width: layerWidth,
        height: layerHeight,
        backgroundImage: `url(${ingredient.sheet})`,
        backgroundPosition: `-${ingredient.x * stackScale}px -${ingredient.y * stackScale}px`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${SPRITE_SHEET_SIZE.width * stackScale}px ${SPRITE_SHEET_SIZE.height * stackScale}px`,
      }}
      onClick={onRemove}
      title={`${ingredient.name} - Clique para remover`}
    >
      <span className="layer-label">{ingredient.name}</span>
    </div>
  );
}

export default function BurgerBuilder({ onBurgerComplete, currencyFormat }: Props) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORIAS>('pao');

  const { setNodeRef, isOver } = useDroppable({ id: 'burger-zone' });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    if (event.over && event.over.id === 'burger-zone') {
      const ingredientId = event.active.id as string;
      // Adiciona o ingrediente à pilha
      setSelectedIngredients(prev => [...prev, ingredientId]);
    }
  };

  const removeIngredient = (index: number) => {
    setSelectedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const clearBurger = () => {
    setSelectedIngredients([]);
  };

  const finalizeBurger = () => {
    if (selectedIngredients.length < 2) {
      alert('Adicione pelo menos 2 ingredientes!');
      return;
    }
    const preco = calcularPrecoTotal(selectedIngredients);
    onBurgerComplete(selectedIngredients, preco);
    setSelectedIngredients([]);
  };

  // Ordena ingredientes por ordem de empilhamento
  const sortedIngredients = selectedIngredients
    .map(id => getIngredientePorId(id))
    .filter((ing): ing is Ingredient => ing !== undefined)
    .sort((a, b) => a.order - b.order);

  const totalPrice = calcularPrecoTotal(selectedIngredients);

  // Filtra ingredientes por categoria selecionada
  const ingredientsByCategory = ingredients.filter(
    ing => ing.category === activeCategory
  );

  const activeIngredient = activeId ? getIngredientePorId(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="burger-builder">
        {/* Painel de Categorias */}
        <div className="categories-tabs">
          {Object.entries(CATEGORIAS).map(([key, value]) => (
            <button
              key={key}
              className={`category-tab ${activeCategory === key ? 'active' : ''}`}
              onClick={() => setActiveCategory(key as keyof typeof CATEGORIAS)}
              style={{ borderBottomColor: activeCategory === key ? value.cor : 'transparent' }}
            >
              {value.label}
            </button>
          ))}
        </div>

        {/* Grade de Ingredientes Arrastáveis */}
        <div className="ingredients-grid">
          {ingredientsByCategory.map(ingredient => (
            <DraggableIngredient
              key={ingredient.id}
              ingredient={ingredient}
              currencyFormat={currencyFormat}
            />
          ))}
        </div>

        {/* Área de Montagem */}
        <div className="builder-section">
          <h3>Seu Burger</h3>
          <div ref={setNodeRef}>
            <DropZone isOver={isOver}>
              {sortedIngredients.map((ingredient, index) => (
                <BurgerLayer
                  key={`${ingredient.id}-${index}`}
                  ingredient={ingredient}
                  onRemove={() => removeIngredient(
                    selectedIngredients.findIndex((id, i) =>
                      getIngredientePorId(id)?.id === ingredient.id &&
                      selectedIngredients.slice(0, i).filter(prevId =>
                        getIngredientePorId(prevId)?.id === ingredient.id
                      ).length === sortedIngredients.slice(0, index).filter(
                        prev => prev.id === ingredient.id
                      ).length
                    )
                  )}
                />
              ))}
            </DropZone>
          </div>

          {/* Resumo e Ações */}
          <div className="builder-summary">
            <div className="summary-price">
              <span>Total:</span>
              <strong>{currencyFormat(totalPrice)}</strong>
            </div>
            <div className="builder-actions">
              <button
                className="btn ghost small"
                onClick={clearBurger}
                disabled={selectedIngredients.length === 0}
              >
                Limpar
              </button>
              <button
                className="btn primary"
                onClick={finalizeBurger}
                disabled={selectedIngredients.length < 2}
              >
                Adicionar à Sacola
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay durante arraste */}
      <DragOverlay>
        {activeIngredient ? (
          <div
            className="ingredient-card dragging"
            style={{
              width: activeIngredient.width * 0.45,
              background: 'transparent',
            }}
          >
            <div
              className="ingredient-sprite"
              style={{
                width: activeIngredient.width * 0.45,
                height: activeIngredient.height * 0.45,
                backgroundImage: `url(${activeIngredient.sheet})`,
                backgroundPosition: `-${activeIngredient.x * 0.45}px -${activeIngredient.y * 0.45}px`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${SPRITE_SHEET_SIZE.width * 0.45}px ${SPRITE_SHEET_SIZE.height * 0.45}px`,
              }}
            />
            <div className="ingredient-info">
              <span className="ingredient-name">{activeIngredient.name}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
