"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { IngredientIcon } from './IngredientIcon';
import { cn } from '@/lib/utils';
import { BurgerLayerStack, LayerIngredient } from './BurgerLayerStack';
import { CatalogCategorySlug, getIngredientImage } from '@/lib/assets/ingredientImages';

export type CatalogCategory = {
  id: string;
  slug: CatalogCategorySlug;
  nome: string;
  cor?: string | null;
  ordem: number;
};

export type CatalogIngredient = {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  imagem?: string | null;
  categoriaSlug: CatalogCategorySlug;
  ordem?: number | null;
  categoria?: CatalogCategory | null;
};

const CATEGORY_RULES: Record<CatalogCategorySlug, { min: number; max: number | null }> = {
  pao: { min: 1, max: 1 },
  carne: { min: 1, max: 1 },
  queijo: { min: 0, max: 2 },
  molho: { min: 0, max: 2 },
  vegetais: { min: 0, max: 5 },
  extras: { min: 0, max: 3 },
  especial: { min: 0, max: 1 },
};

const CATEGORY_ICON: Record<CatalogCategorySlug, string> = {
  pao: '🍞',
  carne: '🥩',
  queijo: '🧀',
  molho: '🥫',
  vegetais: '🥬',
  extras: '✨',
  especial: '⭐',
};

type Props = {
  onBurgerComplete: (ingredientes: string[], preco: number) => void;
  currencyFormat: (value: number) => string;
};

type CategoryModalProps = {
  isOpen: boolean;
  category: CatalogCategory;
  onClose: () => void;
  onSelect: (ingredient: CatalogIngredient) => void;
  currencyFormat: (value: number) => string;
  isLastCategory: boolean;
  ingredients: CatalogIngredient[];
};

function CategoryModal({ isOpen, category, onClose, onSelect, currencyFormat, isLastCategory, ingredients }: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-950/80 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">{CATEGORY_ICON[category.slug]}</span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Selecione seu ingrediente</p>
              <h3 className="text-xl font-semibold text-white">{category.nome}</h3>
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
          {ingredients.map((ing) => (
            <button
              key={ing.id}
              className="group relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white shadow-neon-glow transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-400/30"
              onClick={() => onSelect(ing)}
            >
              <IngredientIcon
                src={ing.imagem}
                alt={ing.nome}
                category={ing.categoriaSlug}
                size={104}
                className="mb-3 h-28 w-28"
              />
              <div className="w-full text-center">
                <span className="block text-base font-semibold">{ing.nome}</span>
                <span
                  className={cn(
                    'mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold',
                    ing.preco === 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/80'
                  )}
                >
                  {ing.preco > 0 ? `+ ${currencyFormat(ing.preco)}` : 'Incluso'}
                </span>
              </div>
            </button>
          ))}

          {ingredients.length === 0 && (
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
  selected,
  onRemove,
}: {
  selected: CatalogIngredient[];
  onRemove: (slug: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {selected.map((ing) => (
        <div key={ing.slug} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
          <span>{ing.nome}</span>
          <button
            className="rounded-full bg-white/10 px-2 py-1 text-white/70 transition hover:bg-red-500/20 hover:text-white"
            onClick={() => onRemove(ing.slug)}
            aria-label={`Remover ${ing.nome}`}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function BurgerBuilder({ onBurgerComplete, currencyFormat }: Props) {
  const [selectedIngredients, setSelectedIngredients] = useState<CatalogIngredient[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState<Record<string, CatalogIngredient[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const warnedMissingImage = useRef(new Set<string>());

  const totalPrice = useMemo(() => selectedIngredients.reduce((total, ing) => total + (ing.preco ?? 0), 0), [selectedIngredients]);

  const sortedIngredients = useMemo(
    () =>
      selectedIngredients
        .map<LayerIngredient>((ing) => ({
          id: ing.id,
          slug: ing.slug,
          nome: ing.nome,
          categoriaSlug: ing.categoriaSlug,
          ordemCategoria: ing.categoria?.ordem ?? undefined,
        }))
        .sort((a, b) => (a.ordemCategoria ?? 0) - (b.ordemCategoria ?? 0)),
    [selectedIngredients]
  );

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome)),
    [categories]
  );

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      setError(null);
      try {
        const [catRes, ingRes] = await Promise.all([
          fetch('/api/catalogo/categorias'),
          fetch('/api/catalogo/ingredientes'),
        ]);

        if (!catRes.ok) {
          throw new Error('Não foi possível carregar categorias');
        }
        if (!ingRes.ok) {
          throw new Error('Não foi possível carregar ingredientes');
        }

        const catData: CatalogCategory[] = await catRes.json();
        const ingData: Array<Omit<CatalogIngredient, 'categoriaSlug'> & { categoriaSlug?: CatalogCategorySlug | null }> =
          await ingRes.json();

        setCategories(catData);

        const grouped: Record<string, CatalogIngredient[]> = {};

        ingData.forEach((ing) => {
          const categoriaSlug = (ing.categoriaSlug || ing.categoria?.slug || 'extras') as CatalogCategorySlug;
          const manifestImage = getIngredientImage(ing.slug) || getIngredientImage(categoriaSlug);
          const imagem = ing.imagem || manifestImage || null;

          if (!imagem && !warnedMissingImage.current.has(ing.slug)) {
            console.warn('[catalog] faltando imagem para', ing.slug);
            warnedMissingImage.current.add(ing.slug);
          }

          const normalized: CatalogIngredient = {
            ...ing,
            categoriaSlug,
            imagem,
          };

          grouped[categoriaSlug] = grouped[categoriaSlug] ? [...grouped[categoriaSlug], normalized] : [normalized];
        });

        setIngredientsByCategory(grouped);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar o catálogo.');
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const startFlow = () => {
    setHasStarted(true);
    setActiveCategoryIndex(0);
  };

  const goToNextCategory = () => {
    setActiveCategoryIndex((prev) => {
      if (prev === null) return null;
      if (prev >= sortedCategories.length - 1) return null;
      return prev + 1;
    });
  };

  const handleSelectIngredient = (ingredient: CatalogIngredient) => {
    setSelectedIngredients((prev) => {
      const rule = CATEGORY_RULES[ingredient.categoriaSlug];
      const filtered = prev.filter((ing) => ing.slug !== ingredient.slug);
      const withoutCategory = rule?.max === 1 ? filtered.filter((ing) => ing.categoriaSlug !== ingredient.categoriaSlug) : filtered;
      const sameCategory = withoutCategory.filter((ing) => ing.categoriaSlug === ingredient.categoriaSlug);

      if (rule?.max && rule.max > 1 && sameCategory.length >= rule.max) {
        const trimmed = sameCategory.slice(1 - rule.max);
        return [...withoutCategory.filter((ing) => ing.categoriaSlug !== ingredient.categoriaSlug), ...trimmed, ingredient];
      }

      return [...withoutCategory, ingredient];
    });
    goToNextCategory();
  };

  const handleRemoveIngredient = (slug: string) => {
    setSelectedIngredients((prev) => prev.filter((ing) => ing.slug !== slug));
  };

  const handleFinish = () => {
    if (selectedIngredients.length === 0) {
      alert('Adicione pelo menos um ingrediente antes de finalizar.');
      return;
    }

    onBurgerComplete(selectedIngredients.map((ing) => ing.slug), totalPrice);
    setSelectedIngredients([]);
    setHasStarted(false);
    setActiveCategoryIndex(null);
  };

  const clearAll = () => {
    setSelectedIngredients([]);
  };

  const activeCategory =
    activeCategoryIndex !== null ? sortedCategories[activeCategoryIndex] : null;

  const emptyCatalog = !loading && categories.length === 0;

  return (
    <div className="space-y-8 text-white">
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

      {emptyCatalog && (
        <div className="rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-400/10 p-6 text-white shadow-neon-glow">
          <p className="text-lg font-semibold">Nenhum item encontrado no catálogo.</p>
          <p className="mt-1 text-white/80">Rode o seed recomendado e atualize esta página.</p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText('npm run seed:catalogo').catch(() => undefined);
              alert('Execute "npm run seed:catalogo" no servidor para popular o catálogo.');
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02]"
          >
            Popular catálogo
          </button>
        </div>
      )}

      {!emptyCatalog && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span className="text-2xl">👀</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Visualização em tempo real</p>
                  <p>Montagem em camadas</p>
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/50">
                Total: {currencyFormat(totalPrice)}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <BurgerLayerStack ingredients={sortedIngredients} />
              <div className="space-y-4">
                <p className="text-sm text-white/70">Escolha seus ingredientes e veja o burger ganhar camadas.</p>
                <IngredientsList selected={selectedIngredients} onRemove={handleRemoveIngredient} />
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 shadow-inner shadow-black/30">
                  <p className="font-semibold text-white">Resumo</p>
                  <p>{selectedIngredients.length} ingrediente(s) selecionado(s)</p>
                  <p className="text-emerald-200">{currencyFormat(totalPrice)}</p>
                </div>
              </div>
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

            {loading && <p className="text-sm text-white/60">Carregando catálogo...</p>}
            {error && <p className="text-sm text-red-300">{error}</p>}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sortedCategories.map((category, index) => {
                const isActive = activeCategoryIndex === index;
                const count = selectedIngredients.filter((ing) => ing.categoriaSlug === category.slug).length;

                return (
                  <button
                    key={category.slug}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition hover:border-white/40 hover:bg-white/10',
                      isActive ? 'border-emerald-400/60 shadow-neon-glow' : 'border-white/10',
                      count > 0 && 'border-white/20'
                    )}
                    onClick={() => {
                      setHasStarted(true);
                      setActiveCategoryIndex(index);
                    }}
                    style={isActive ? { boxShadow: `0 10px 30px ${(category.cor || '#22c55e')}33` } : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">{CATEGORY_ICON[category.slug]}</span>
                      <div className="leading-tight">
                        <span className="text-sm font-semibold">{category.nome}</span>
                        {count > 0 && (
                          <span className="block text-xs text-emerald-200">{count} item{count > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-full border text-lg font-bold',
                        count > 0 ? 'border-emerald-300/50 bg-emerald-400/20 text-white' : 'border-white/10 bg-white/5 text-white/60'
                      )}
                    >
                      {count > 0 ? '✓' : '+'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3">
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
      )}

      {activeCategory && (
        <CategoryModal
          isOpen={activeCategoryIndex !== null}
          category={activeCategory}
          onClose={goToNextCategory}
          onSelect={handleSelectIngredient}
          currencyFormat={currencyFormat}
          isLastCategory={activeCategoryIndex === sortedCategories.length - 1}
          ingredients={ingredientsByCategory[activeCategory.slug] || []}
        />
      )}
    </div>
  );
}
