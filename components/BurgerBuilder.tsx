"use client";

import { useMemo, useState } from 'react';
import { IngredientIcon } from './IngredientIcon';
import {
  Ingredient,
  IngredientCategory,
  CATEGORIAS,
  getIngredientePorId,
  getIngredientesPorCategoria,
  calcularPrecoTotal,
} from '@/lib/ingredientsData';
import { cn } from '@/lib/utils';
import { BurgerStackPreview } from './widgets/BurgerStackPreview';

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
  isLastCategory: boolean;
};

function CategoryModal({ isOpen, category, onClose, onSelect, currencyFormat, isLastCategory }: CategoryModalProps) {
  if (!isOpen) return null;

  const ingredientes = getIngredientesPorCategoria(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950/80 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">{CATEGORY_ICONS[category]}</span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Selecione seu ingrediente</p>
              <h3 className="text-xl font-semibold text-white">{CATEGORIAS[category].label}</h3>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02]"
            onClick={onClose}
          >
            {isLastCategory ? 'Finalizar' : 'Próximo Ingrediente'} <span className="text-lg">→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {ingredientes.map((ing) => (
            <button
              key={ing.id}
              className="group relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white shadow-neon-glow transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-400/30"
              onClick={() => onSelect(ing.id)}
            >
              <IngredientIcon
                src={ing.image}
                alt={ing.name}
                category={ing.category}
                size={104}
                className="mb-3 h-28 w-28"
              />
              <div className="w-full text-center">
                <span className="block text-base font-semibold">{ing.name}</span>
                <span className={cn('mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold', ing.price === 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/80')}>
                  {ing.price > 0 ? `+ ${currencyFormat(ing.price)}` : 'Incluso'}
                </span>
              </div>
            </button>
          ))}

          {ingredientes.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-white/70">
              Nenhum ingrediente disponível
            </div>
          )}
        </div>
      </div>
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
      <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-center text-white/70">
        Nenhum ingrediente adicionado
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ing, index) => (
        <div
          key={`${ing.id}-${index}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white shadow-sm shadow-black/30 backdrop-blur"
        >
          <IngredientIcon
            src={ing.image}
            alt={ing.name}
            category={ing.category}
            size={28}
            className="h-7 w-7 border-none bg-white/10 text-xs"
          />
          <span>{ing.name}</span>
          <button
            className="rounded-full bg-white/10 px-2 py-1 text-white/70 transition hover:bg-red-500/20 hover:text-white"
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
    <div className="space-y-8 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 shadow-lg shadow-black/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,213,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,80,255,0.12),transparent_30%)]" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Monte do seu jeito
            </div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">Crie seu Hambúrguer</h1>
            <p className="max-w-2xl text-white/70">
              Escolha cada ingrediente e veja seu hambúrguer ganhar vida em tempo real.
            </p>
            {!hasStarted && (
              <button
                className="group inline-flex items-center gap-3 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02]"
                onClick={startFlow}
              >
                <span className="text-lg">🍔</span>
                Começar a Montar
                <span className="text-lg transition group-hover:translate-x-1">→</span>
              </button>
            )}
          </div>
          <div className="relative flex h-24 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white/70 shadow-neon-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,255,170,0.15),transparent_40%)]" />
            <div className="relative text-center">
              <p className="text-xs uppercase tracking-[0.2em]">Total Atual</p>
              <p className="text-3xl font-black">{currencyFormat(totalPrice)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Builder Area */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Layered Burger Preview */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <span className="text-2xl">👀</span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Visualização</p>
                <p>Em tempo real</p>
              </div>
            </div>
            <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/50">
              Total: {currencyFormat(totalPrice)}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <BurgerStackPreview ingredients={sortedIngredients} />
          </div>

          <div className="mt-6">
            <IngredientsList
              selectedIds={selectedIngredients}
              onRemove={handleRemoveIngredient}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
              onClick={clearAll}
              disabled={selectedIngredients.length === 0}
            >
              Limpar Tudo
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60 disabled:shadow-none"
              onClick={handleFinish}
              disabled={selectedIngredients.length === 0}
            >
              <span>Adicionar à Sacola</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Escolha os ingredientes</p>
              <h2 className="text-xl font-semibold">Categorias</h2>
              <p className="text-sm text-white/70">Toque em uma categoria para adicionar</p>
            </div>
            {selectedIngredients.length > 0 && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">{selectedIngredients.length} selecionado(s)</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CATEGORY_FLOW.map((category, index) => {
              const isActive = activeCategoryIndex === index;
              const count = selectedIngredients.filter(
                (id) => getIngredientePorId(id)?.category === category
              ).length;

              return (
                <button
                  key={category}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition hover:border-white/40 hover:bg-white/10',
                    isActive ? 'border-emerald-400/60 shadow-neon-glow' : 'border-white/10',
                    count > 0 && 'border-white/20'
                  )}
                  onClick={() => {
                    setHasStarted(true);
                    setActiveCategoryIndex(index);
                  }}
                  style={isActive ? { boxShadow: `0 10px 30px ${CATEGORIAS[category].cor}33` } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">{CATEGORY_ICONS[category]}</span>
                    <div className="leading-tight">
                      <span className="text-sm font-semibold">{CATEGORIAS[category].label}</span>
                      {count > 0 && (
                        <span className="block text-xs text-emerald-200">{count} item{count > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div className={cn('flex h-9 w-9 items-center justify-center rounded-full border text-lg font-bold', count > 0 ? 'border-emerald-300/50 bg-emerald-400/20 text-white' : 'border-white/10 bg-white/5 text-white/60')}>
                    {count > 0 ? '✓' : '+'}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
          isLastCategory={activeCategoryIndex === CATEGORY_FLOW.length - 1}
        />
      )}
    </div>
  );
}
