"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IngredientIcon } from './IngredientIcon';
import { cn } from '@/lib/utils';
import type { LayerIngredient } from './BurgerLayerStack';
import BurgerPreview from './BurgerPreview';
import { CatalogCategorySlug, getIngredientImage } from '@/lib/assets/ingredientImages';
import { Burger3DPreview } from './Burger3DPreview';

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

function normalizeCategorySlug(slug?: string | null): CatalogCategorySlug {
  const value = slug?.toLowerCase();
  switch (value) {
    case 'vegetal':
    case 'vegetais':
      return 'vegetais';
    case 'extra':
    case 'extras':
      return 'extras';
    case 'pao':
    case 'carne':
    case 'queijo':
    case 'molho':
    case 'especial':
      return value;
    default:
      return 'extras';
  }
}

// Tipo exportado para uso no contexto
export type BurgerIngredientForCart = {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  categoriaSlug: string;
};

export type BurgerCartPayload = {
  ingredientes: BurgerIngredientForCart[];
  precoUnitario: number;
  quantidade: number;
};

type Props = {
  onBurgerComplete: (payload: BurgerCartPayload) => void;
  currencyFormat: (value: number) => string;
};

type SelectedMap = Record<CatalogCategorySlug, CatalogIngredient[]>;

type CategoryModalProps = {
  isOpen: boolean;
  category: CatalogCategory;
  onClose: () => void;
  onBack: () => void;
  onExit: () => void;
  onToggle: (ingredient: CatalogIngredient) => void;
  currencyFormat: (value: number) => string;
  isLastCategory: boolean;
  ingredients: CatalogIngredient[];
  selected: SelectedMap;
  subtotal: number;
};

function CategoryModal({
  isOpen,
  category,
  onClose,
  onBack,
  onExit,
  onToggle,
  currencyFormat,
  isLastCategory,
  ingredients,
  selected,
  subtotal,
}: CategoryModalProps) {
  if (!isOpen) return null;

  const selectedIds = new Set(selected[category.slug]?.map((ing) => ing.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 text-white shadow-2xl shadow-black/40 ring-1 ring-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl">{CATEGORY_ICON[category.slug]}</span>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Selecione seu ingrediente</p>
              <h3 className="text-xl font-semibold text-white">{category.nome}</h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              onClick={onBack}
              aria-label="Voltar para categoria anterior"
            >
              ← Voltar
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full border border-red-300/50 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
              onClick={onExit}
              aria-label="Sair do construtor"
            >
              Sair
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
              onClick={onClose}
              aria-label={isLastCategory ? 'Finalizar seleção' : 'Ir para próxima categoria'}
            >
              {isLastCategory ? 'Finalizar' : 'Próximo Ingrediente'} <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        <div className="flex max-h-[75vh] flex-1 flex-col">
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3">
            {ingredients.map((ing) => {
              const isSelected = selectedIds.has(ing.id);

              return (
                <button
                  key={ing.id}
                  className={cn(
                    'group relative flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-white shadow-neon-glow transition hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-emerald-400/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400',
                    isSelected && 'border-emerald-400/70 ring-2 ring-emerald-400/40 shadow-emerald-400/40'
                  )}
                  onClick={() => onToggle(ing)}
                  aria-pressed={isSelected}
                >
                  <label className="absolute right-3 top-3 flex items-center gap-2 text-sm text-white/70" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggle(ing)}
                      className="h-4 w-4 rounded border-white/30 bg-white/10 text-emerald-400 focus:ring-emerald-400"
                      aria-label={`Selecionar ${ing.nome}`}
                    />
                  </label>
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
                        'mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold backdrop-blur',
                        ing.preco === 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/80'
                      )}
                    >
                      {ing.preco > 0 ? `+ ${currencyFormat(ing.preco)}` : 'Incluso'}
                    </span>
                  </div>
                </button>
              );
            })}

            {ingredients.length === 0 && (
              <div className="col-span-full">
                <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300/40 bg-emerald-400/5 p-8 text-center text-white/80">
                  <p className="text-lg font-semibold text-white">Sem ingredientes por aqui</p>
                  <p className="mt-2 max-w-md text-sm text-white/60">
                    Avance para a próxima etapa para continuar a montagem.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-white/10 bg-slate-900/80 px-6 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-white/80">Subtotal atualizado em tempo real</p>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-base font-semibold text-emerald-100 ring-1 ring-emerald-400/40">
                Subtotal: {currencyFormat(subtotal)}
              </div>
            </div>
          </div>
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
  const [selectedByCategory, setSelectedByCategory] = useState<SelectedMap>({} as SelectedMap);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [ingredientsByCategory, setIngredientsByCategory] = useState<Record<string, CatalogIngredient[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedInfo, setSeedInfo] = useState<{ seeded?: boolean; reason?: string } | undefined>();
  const [catalogStatus, setCatalogStatus] = useState<'ready' | 'missing' | 'empty' | 'error'>('ready');
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [seedLoading, setSeedLoading] = useState(false);
  const [builderStage, setBuilderStage] = useState<'build' | 'final'>('build');
  const warnedMissingImage = useRef(new Set<string>());
  const categoriesSectionRef = useRef<HTMLDivElement | null>(null);
  const [quantity, setQuantity] = useState(1);

  const BASE_PRICE = 12;

  const incrementQuantity = () => setQuantity((prev) => Math.min(10, prev + 1));
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const selectedIngredients = useMemo(() => Object.values(selectedByCategory).flat(), [selectedByCategory]);

  const totalPrice = useMemo(
    () => BASE_PRICE + selectedIngredients.reduce((total, ing) => total + (ing.preco ?? 0), 0),
    [selectedIngredients]
  );

  const sortedIngredients = useMemo<LayerIngredient[]>(
    () =>
      selectedIngredients
        .map((ing): LayerIngredient => ({
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

  const loadCatalog = useCallback(async ({ seed }: { seed?: boolean } = {}) => {
    setLoading(true);
    setError(null);
    setMissingTables([]);

    try {
      const response = await fetch(`/api/catalog${seed ? '?seed=1' : ''}`);

      if (!response.ok) {
        throw new Error('Não foi possível carregar o catálogo');
      }

      const data: {
        ok: boolean;
        categories: CatalogCategory[];
        items: Array<Omit<CatalogIngredient, 'categoriaSlug'> & { categoriaSlug?: CatalogCategorySlug | null }>;
        seeded?: { seeded?: boolean; reason?: string };
        code?: string;
        missing?: string[];
        message?: string;
        action?: string;
      } = await response.json();

      if (!data.ok) {
        if (data.code === 'MISSING_TABLES') {
          setCatalogStatus('missing');
          setMissingTables(data.missing || []);
          setError('Banco não migrado. Consulte o README para aplicar as migrations.');
          return;
        }

        if (data.code === 'CATALOG_EMPTY') {
          setCatalogStatus('empty');
          setSeedInfo(data.seeded);
          setCategories(data.categories || []);
          setIngredientsByCategory({});
          setError(data.message || 'Catálogo vazio.');
          return;
        }

        throw new Error('Resposta inesperada ao carregar catálogo');
      }

      setCatalogStatus('ready');
      setSeedInfo(data.seeded);

      const normalizedCategories = (data.categories || []).map((cat) => ({
        ...cat,
        slug: normalizeCategorySlug(cat.slug),
      }));

      setCategories(normalizedCategories);

      const grouped: Record<string, CatalogIngredient[]> = {};

      (data.items || []).forEach((ing) => {
        const categoriaSlug = normalizeCategorySlug(ing.categoriaSlug || ing.categoria?.slug || 'extras');
        const manifestImage = getIngredientImage(ing.slug) || getIngredientImage(categoriaSlug);
        const imagem = manifestImage || ing.imagem || null;

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
      setError('Catálogo indisponível no momento. Tente novamente.');
      setCatalogStatus('error');
    } finally {
      setLoading(false);
      setSeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    if (hasStarted && categoriesSectionRef.current) {
      categoriesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [hasStarted]);

  const handleSeedRequest = async () => {
    setSeedLoading(true);
    await loadCatalog({ seed: true });
  };

  const startFlow = () => {
    setHasStarted(true);
    setBuilderStage('build');
    setActiveCategoryIndex(0);
  };

  const goToNextCategory = () => {
    setActiveCategoryIndex((prev) => {
      if (prev === null) return null;
      if (prev >= sortedCategories.length - 1) return null;
      return prev + 1;
    });
  };

  const goToPreviousCategory = () => {
    setActiveCategoryIndex((prev) => {
      if (prev === null) return null;
      if (prev <= 0) return null;
      return prev - 1;
    });
  };

  const handleCloseCategoryModal = () => {
    if (activeCategoryIndex !== null && activeCategoryIndex >= sortedCategories.length - 1) {
      setActiveCategoryIndex(null);
      return;
    }
    goToNextCategory();
  };

  const handleToggleIngredient = (ingredient: CatalogIngredient) => {
    setSelectedByCategory((prev) => {
      const existing = prev[ingredient.categoriaSlug] || [];
      const rule = CATEGORY_RULES[ingredient.categoriaSlug];
      const alreadySelected = existing.some((ing) => ing.id === ingredient.id);

      if (alreadySelected) {
        const filtered = existing.filter((ing) => ing.id !== ingredient.id);
        return { ...prev, [ingredient.categoriaSlug]: filtered };
      }

      let nextList = [...existing, ingredient];

      if (rule?.max && rule.max > 0 && nextList.length > rule.max) {
        nextList = nextList.slice(nextList.length - rule.max);
      }

      return { ...prev, [ingredient.categoriaSlug]: nextList };
    });
  };

  const handleRemoveIngredient = (slug: string) => {
    setSelectedByCategory((prev) => {
      const next: SelectedMap = {} as SelectedMap;

      (Object.keys(prev) as CatalogCategorySlug[]).forEach((category) => {
        next[category] = (prev[category] || []).filter((ing) => ing.slug !== slug);
      });

      return next;
    });
  };

  const handleFinish = () => {
    const requiredMissing = (['pao', 'carne', 'queijo'] as CatalogCategorySlug[]).filter(
      (cat) => !(selectedByCategory[cat]?.length)
    );

    if (requiredMissing.length > 0) {
      const firstMissingIndex = sortedCategories.findIndex((cat) => cat.slug === requiredMissing[0]);
      setActiveCategoryIndex(firstMissingIndex >= 0 ? firstMissingIndex : 0);
      alert('Escolha pelo menos um pão, uma carne e um queijo para continuar.');
      return;
    }

    setBuilderStage('final');
    setActiveCategoryIndex(null);
  };

  const handleConfirmFinish = () => {
    if (selectedIngredients.length === 0) return;

    const ingredientesParaCarrinho: BurgerIngredientForCart[] = selectedIngredients.map((ing) => ({
      id: ing.id,
      slug: ing.slug,
      nome: ing.nome,
      preco: ing.preco,
      categoriaSlug: ing.categoriaSlug,
    }));

    onBurgerComplete({
      ingredientes: ingredientesParaCarrinho,
      precoUnitario: totalPrice,
      quantidade: Math.max(1, quantity),
    });
    setSelectedByCategory({} as SelectedMap);
    setHasStarted(false);
    setActiveCategoryIndex(null);
    setBuilderStage('build');
    setQuantity(1);
  };

  const handleReturnToBuildStage = () => {
    setBuilderStage('build');
  };

  const clearAll = () => {
    setSelectedByCategory({} as SelectedMap);
    setBuilderStage('build');
    setQuantity(1);
  };

  const handleExitFlow = () => {
    const hasSelection = selectedIngredients.length > 0;
    if (hasSelection) {
      const confirmExit = window.confirm('Deseja sair? Você perderá a montagem atual.');
      if (!confirmExit) return;
    }
    setSelectedByCategory({} as SelectedMap);
    setActiveCategoryIndex(null);
    setHasStarted(false);
    setBuilderStage('build');
  };

  const activeCategory =
    activeCategoryIndex !== null ? sortedCategories[activeCategoryIndex] : null;

  const hasCatalog = Object.values(ingredientsByCategory).some((list) => list.length > 0);

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

      {!hasCatalog && (
        <div className="space-y-4 rounded-2xl border border-dashed border-emerald-400/40 bg-emerald-400/10 p-6 text-white shadow-neon-glow">
          <div className="space-y-1">
            <p className="text-lg font-semibold">Catálogo</p>
            <p className="text-white/80">
              {catalogStatus === 'missing'
                ? 'Banco não migrado. Aplique as migrations antes de popular o catálogo.'
                : loading
                  ? 'Estamos preparando os ingredientes para você.'
                  : 'Ainda não encontramos ingredientes ativos. Tente novamente ou peça para popular automaticamente.'}
            </p>
          </div>

          {catalogStatus === 'missing' && (
            <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white/80">
              <p className="font-semibold">Tabelas ausentes</p>
              <p className="text-white/70">{missingTables.join(', ') || 'Verifique migrations pendentes.'}</p>
              <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-black/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Para corrigir, execute:</p>
                <code className="block text-xs text-emerald-300">npm run db:release</code>
                <p className="text-xs text-white/50">ou manualmente:</p>
                <code className="block text-xs text-emerald-300">npx prisma migrate deploy && npx prisma db seed</code>
              </div>
            </div>
          )}

          {seedInfo && !seedInfo.seeded && catalogStatus !== 'missing' && (
            <p className="text-sm text-emerald-100/80">
              Auto-seed: {seedInfo.reason === 'env-disabled' ? 'desativado pela configuração' : 'aguardando disponibilidade'}.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadCatalog()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:opacity-60"
            >
              Tentar novamente
            </button>
            <button
              onClick={handleSeedRequest}
              disabled={seedLoading || catalogStatus === 'missing'}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/70"
            >
              {seedLoading ? 'Populando catálogo...' : 'Popular catálogo'}
            </button>
          </div>
        </div>
      )}

      {hasCatalog && builderStage === 'build' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 text-lg font-semibold">
                <span className="text-2xl">🍔</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Preview do burger</p>
                  <p>Veja seu hambúrguer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/50">
                  Total: {currencyFormat(totalPrice)}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <BurgerPreview mode="build" />
              <div className="space-y-4">
                <p className="text-sm text-white/70">
                  Escolha seus ingredientes e veja o burger ganhar vida. Esta visualização é estável para você focar na seleção.
                </p>
                <IngredientsList selected={selectedIngredients} onRemove={handleRemoveIngredient} />
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 shadow-inner shadow-black/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Resumo</p>
                      <p>{selectedIngredients.length} ingrediente(s) selecionado(s)</p>
                    </div>
                    <div className="text-right text-xs text-white/60">
                      <p>Qtd.</p>
                      <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white">
                        <button
                          className="text-lg leading-none text-white/70 hover:text-white"
                          onClick={decrementQuantity}
                          aria-label="Diminuir quantidade"
                        >
                          −
                        </button>
                        <span className="min-w-[36px] text-center text-base font-semibold">{quantity}</span>
                        <button
                          className="text-lg leading-none text-white/70 hover:text-white"
                          onClick={incrementQuantity}
                          aria-label="Aumentar quantidade"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-emerald-200">{currencyFormat(totalPrice)} cada</p>
                  <p className="text-white/80">
                    Total para {quantity} burger{quantity > 1 ? 's' : ''}: <span className="font-semibold text-emerald-100">{currencyFormat(totalPrice * quantity)}</span>
                  </p>
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
                <span>Finalizar montagem</span>
                <span className="text-lg">→</span>
              </button>
            </div>
          </div>

          <div
            ref={categoriesSectionRef}
            className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur"
          >
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

      {hasCatalog && builderStage === 'final' && (
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 shadow-2xl shadow-black/50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Preview final</p>
                <h3 className="text-2xl font-bold text-white">Seu burger premium está pronto</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                  onClick={handleReturnToBuildStage}
                >
                  Voltar para edição
                </button>
                <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-400/50">
                  Total: {currencyFormat(totalPrice)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <BurgerPreview mode="final" className="max-w-[420px]" />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/30 backdrop-blur">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">Resumo da montagem</p>
                <h2 className="text-xl font-semibold">Confira antes de enviar</h2>
              </div>
              {selectedIngredients.length > 0 && (
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/50">{selectedIngredients.length} ingrediente(s)</span>
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4 text-white/80 shadow-inner shadow-black/30">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/80">
                <span className="font-semibold text-white">Quantidade</span>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <button
                    className="text-lg leading-none text-white/70 hover:text-white"
                    onClick={decrementQuantity}
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="min-w-[36px] text-center text-base font-semibold">{quantity}</span>
                  <button
                    className="text-lg leading-none text-white/70 hover:text-white"
                    onClick={incrementQuantity}
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>
              </div>
              <IngredientsList selected={selectedIngredients} onRemove={handleRemoveIngredient} />
              <div className="flex items-center justify-between text-sm">
                <span>Total estimado</span>
                <div className="text-right">
                  <p className="text-xs text-white/60">{quantity}x {currencyFormat(totalPrice)} cada</p>
                  <p className="text-base font-semibold text-emerald-200">{currencyFormat(totalPrice * quantity)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                onClick={handleReturnToBuildStage}
              >
                Voltar para editar
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/60 disabled:shadow-none"
                onClick={handleConfirmFinish}
                disabled={selectedIngredients.length === 0}
              >
                <span>Adicionar à Sacola</span>
                <span className="text-lg">✔</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {activeCategory && (
        <CategoryModal
          isOpen={activeCategoryIndex !== null}
          category={activeCategory}
          onClose={handleCloseCategoryModal}
          onBack={goToPreviousCategory}
          onExit={handleExitFlow}
          onToggle={handleToggleIngredient}
          currencyFormat={currencyFormat}
          isLastCategory={activeCategoryIndex === sortedCategories.length - 1}
          ingredients={ingredientsByCategory[activeCategory.slug] || []}
          selected={selectedByCategory}
          subtotal={totalPrice}
        />
      )}
    </div>
  );
}
