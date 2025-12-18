/* eslint-disable @next/next/no-img-element */
"use client";

import { HAMBURGER_BASE_IMAGE, getIngredientImage, CatalogCategorySlug } from '@/lib/assets/ingredientImages';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { useMemo, useEffect, useState, useRef } from 'react';

export type LayerIngredient = {
  id: string;
  slug: string;
  nome: string;
  categoriaSlug: CatalogCategorySlug;
  ordemCategoria?: number;
};

const CATEGORY_LAYER_ORDER: Record<CatalogCategorySlug, number> = {
  pao: 90,
  extras: 75,
  vegetais: 70,
  queijo: 64,
  carne: 58,
  molho: 52,
  especial: 80,
};

const CATEGORY_SIZES: Record<CatalogCategorySlug, number> = {
  pao: 95,
  carne: 88,
  queijo: 82,
  vegetais: 78,
  extras: 75,
  molho: 70,
  especial: 80,
};

// Configuração de profundidade para efeito visual
const LAYER_DEPTH: Record<CatalogCategorySlug, { yOffset: number; shadow: number }> = {
  pao: { yOffset: -55, shadow: 22 },
  extras: { yOffset: -30, shadow: 18 },
  especial: { yOffset: -20, shadow: 16 },
  vegetais: { yOffset: -10, shadow: 14 },
  queijo: { yOffset: 5, shadow: 12 },
  carne: { yOffset: 25, shadow: 10 },
  molho: { yOffset: 45, shadow: 8 },
};

function resolveSize(categoriaSlug: CatalogCategorySlug, container: number) {
  const ratio = CATEGORY_SIZES[categoriaSlug] ?? 70;
  return Math.round((container * ratio) / 100);
}

function resolveZIndex(item: LayerIngredient) {
  return CATEGORY_LAYER_ORDER[item.categoriaSlug] ?? 10;
}

function resolveDepth(categoriaSlug: CatalogCategorySlug) {
  return LAYER_DEPTH[categoriaSlug] ?? { yOffset: 0, shadow: 10 };
}

export function BurgerLayerStack({ ingredients }: { ingredients: LayerIngredient[] }) {
  const containerSize = 360;
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());
  const prevIdsRef = useRef<Set<string>>(new Set());

  const sorted = useMemo(
    () =>
      [...ingredients].sort((a, b) => {
        const orderA = a.ordemCategoria ?? CATEGORY_LAYER_ORDER[a.categoriaSlug] ?? 0;
        const orderB = b.ordemCategoria ?? CATEGORY_LAYER_ORDER[b.categoriaSlug] ?? 0;
        return orderA - orderB;
      }),
    [ingredients]
  );

  // Animação de entrada para novos ingredientes
  useEffect(() => {
    const currentIds = new Set(ingredients.map(i => i.id));
    const newIds = ingredients.filter(i => !prevIdsRef.current.has(i.id));

    // Anima novos ingredientes com delay escalonado
    newIds.forEach((ingredient, index) => {
      setTimeout(() => {
        setVisibleIds(prev => new Set([...prev, ingredient.id]));
      }, index * 80);
    });

    // Remove IDs que não existem mais
    setVisibleIds(prev => {
      const updated = new Set<string>();
      prev.forEach(id => {
        if (currentIds.has(id)) updated.add(id);
      });
      return updated;
    });

    prevIdsRef.current = currentIds;
  }, [ingredients]);

  const hasPao = sorted.some(i => i.categoriaSlug === 'pao');

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[420px] rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950 p-6 shadow-inner shadow-black/30"
      style={{ minHeight: containerSize }}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-2 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.18),transparent_35%)]" />

      {/* Container das camadas */}
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl">
        {/* Imagem base quando não tem ingredientes */}
        {sorted.length === 0 && (
          <img
            src={resolveAssetUrl(HAMBURGER_BASE_IMAGE) || ''}
            alt="Monte seu hambúrguer"
            className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-30 animate-pulse"
            loading="lazy"
          />
        )}

        {/* Sombra embaixo do hambúrguer */}
        {sorted.length > 0 && (
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/30 blur-xl transition-all duration-500"
            style={{
              width: containerSize * 0.55,
              height: containerSize * 0.1,
              bottom: '12%',
              opacity: Math.min(sorted.length * 0.15, 0.8),
            }}
          />
        )}

        {/* Camadas do hambúrguer */}
        {sorted.map((ingredient, index) => {
          const imageUrl = resolveAssetUrl(getIngredientImage(ingredient.slug));
          const size = resolveSize(ingredient.categoriaSlug, containerSize);
          const depth = resolveDepth(ingredient.categoriaSlug);
          const isVisible = visibleIds.has(ingredient.id);

          // Calcula posição baseada na pilha
          const stackOffset = index * 10;
          const yPosition = depth.yOffset + stackOffset;
          const scale = 1 - (index * 0.012);

          return (
            <div
              key={ingredient.id}
              className={cn(
                "absolute left-1/2 top-1/2 transition-all duration-400 ease-out",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4 scale-95"
              )}
              style={{
                width: size,
                zIndex: resolveZIndex(ingredient),
                transform: `translateX(-50%) translateY(calc(-50% + ${yPosition}px)) scale(${scale})`,
                filter: `drop-shadow(0 ${depth.shadow}px ${depth.shadow * 1.2}px rgba(0,0,0,0.45))`,
                transitionDelay: isVisible ? `${index * 40}ms` : '0ms',
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={ingredient.nome}
                  className="w-full h-auto"
                  draggable={false}
                  loading="lazy"
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/60 to-orange-600/60 text-xs font-medium text-white shadow-lg ring-1 ring-white/20"
                  style={{
                    width: size,
                    height: size * 0.35,
                  }}
                >
                  {ingredient.nome}
                </div>
              )}
            </div>
          );
        })}

        {/* Pão inferior (base) - aparece quando tem pão selecionado */}
        {hasPao && sorted.length > 0 && (
          <div
            className="absolute left-1/2 top-1/2 transition-all duration-500"
            style={{
              width: containerSize * 0.88,
              zIndex: 5,
              transform: `translateX(-50%) translateY(calc(-50% + 85px)) scaleY(-0.55) scaleX(0.98)`,
              filter: 'drop-shadow(0 -6px 10px rgba(0,0,0,0.25)) brightness(0.8) saturate(0.9)',
              opacity: 0.85,
            }}
          >
            <img
              src={resolveAssetUrl(getIngredientImage('pao-brioche')) || ''}
              alt="Pão inferior"
              className="w-full h-auto"
              draggable={false}
              loading="lazy"
            />
          </div>
        )}

        {/* Contador de camadas */}
        {sorted.length > 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm ring-1 ring-emerald-500/30">
            {sorted.length} camada{sorted.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Texto placeholder */}
        {sorted.length === 0 && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-white/40">
            Selecione ingredientes para começar
          </p>
        )}
      </div>
    </div>
  );
}
