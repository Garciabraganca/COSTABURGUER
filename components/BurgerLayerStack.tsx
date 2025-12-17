/* eslint-disable @next/next/no-img-element */
"use client";

import { HAMBURGER_BASE_IMAGE, getIngredientImage, CatalogCategorySlug } from '@/lib/assets/ingredientImages';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { useMemo } from 'react';

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
  pao: 90,
  carne: 82,
  queijo: 76,
  vegetais: 72,
  extras: 70,
  molho: 66,
  especial: 78,
};

function resolveSize(categoriaSlug: CatalogCategorySlug, container: number) {
  const ratio = CATEGORY_SIZES[categoriaSlug] ?? 70;
  return Math.round((container * ratio) / 100);
}

function resolveZIndex(item: LayerIngredient) {
  return CATEGORY_LAYER_ORDER[item.categoriaSlug] ?? 10;
}

export function BurgerLayerStack({ ingredients }: { ingredients: LayerIngredient[] }) {
  const containerSize = 360;
  const sorted = useMemo(
    () =>
      [...ingredients].sort((a, b) => {
        const orderA = a.ordemCategoria ?? CATEGORY_LAYER_ORDER[a.categoriaSlug] ?? 0;
        const orderB = b.ordemCategoria ?? CATEGORY_LAYER_ORDER[b.categoriaSlug] ?? 0;
        return orderA - orderB;
      }),
    [ingredients]
  );

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[420px] rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950 p-6 shadow-inner shadow-black/30"
      style={{ minHeight: containerSize }}
    >
      <div className="absolute inset-2 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.18),transparent_35%)]" />
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl">
        <img
          src={resolveAssetUrl(HAMBURGER_BASE_IMAGE) || ''}
          alt="Base do hambúrguer"
          className="absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 object-contain opacity-60"
          loading="lazy"
        />
        {sorted.map((ingredient, index) => {
          const imageUrl = resolveAssetUrl(getIngredientImage(ingredient.slug));
          const size = resolveSize(ingredient.categoriaSlug, containerSize);
          const baseClass = 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_18px_24px_rgba(0,0,0,0.38)]';
          const offset = (sorted.length - index) * 1.2;
          const scale = 1 - index * 0.01;

          if (!imageUrl) {
            console.warn('[catalog] camada sem imagem', ingredient.slug);
          }

          return imageUrl ? (
            <img
              key={ingredient.id}
              src={imageUrl}
              alt={ingredient.nome}
              style={{
                width: size,
                zIndex: resolveZIndex(ingredient),
                transform: `translate(-50%, calc(-50% + ${offset}px)) scale(${scale})`,
                filter: 'drop-shadow(0 22px 26px rgba(0,0,0,0.36))',
                transition: 'transform 200ms ease-out',
              }}
              className={cn(baseClass)}
              loading="lazy"
            />
          ) : (
            <div
              key={ingredient.id}
              style={{ width: size, height: size, zIndex: resolveZIndex(ingredient) }}
              className={cn(
                baseClass,
                'flex items-center justify-center rounded-full bg-gradient-to-br from-white/10 via-white/5 to-white/0 text-xs uppercase tracking-wide text-white/70 ring-1 ring-white/10'
              )}
            >
              {ingredient.nome}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
