/* eslint-disable @next/next/no-img-element */
"use client";

import { getIngredientImage, CatalogCategorySlug } from '@/lib/assets/ingredientImages';
import { resolveAssetUrl } from '@/lib/utils';
import { useMemo } from 'react';

export type LayerIngredient = {
  id: string;
  slug: string;
  nome: string;
  categoriaSlug: CatalogCategorySlug;
  ordemCategoria?: number;
};

// Ordem das camadas de baixo para cima (como um hambúrguer real)
const CATEGORY_LAYER_ORDER: Record<CatalogCategorySlug, number> = {
  pao: 10,       // Base - pão de baixo
  molho: 20,     // Molho na base
  carne: 30,     // Carne
  queijo: 40,    // Queijo derretendo na carne
  vegetais: 50,  // Vegetais
  extras: 60,    // Extras
  especial: 70,  // Ingredientes especiais no topo
};

// Altura vertical de cada camada para empilhamento (em pixels)
const CATEGORY_HEIGHT: Record<CatalogCategorySlug, number> = {
  pao: 24,
  carne: 20,
  queijo: 14,
  vegetais: 16,
  extras: 14,
  molho: 10,
  especial: 18,
};

// Tamanho das imagens por categoria (porcentagem do container)
const CATEGORY_SIZES: Record<CatalogCategorySlug, number> = {
  pao: 90,
  carne: 85,
  queijo: 82,
  vegetais: 78,
  extras: 75,
  molho: 70,
  especial: 80,
};

function resolveSize(categoriaSlug: CatalogCategorySlug, container: number) {
  const ratio = CATEGORY_SIZES[categoriaSlug] ?? 80;
  return Math.round((container * ratio) / 100);
}

export function BurgerLayerStack({ ingredients }: { ingredients: LayerIngredient[] }) {
  const containerWidth = 280;

  // Ordenar ingredientes de baixo para cima
  const sorted = useMemo(
    () =>
      [...ingredients].sort((a, b) => {
        const orderA = CATEGORY_LAYER_ORDER[a.categoriaSlug] ?? 50;
        const orderB = CATEGORY_LAYER_ORDER[b.categoriaSlug] ?? 50;
        return orderA - orderB;
      }),
    [ingredients]
  );

  // Calcular posição vertical de cada camada (empilhamento)
  const layersWithPosition = useMemo(() => {
    let currentHeight = 0;
    return sorted.map((ingredient, index) => {
      const height = CATEGORY_HEIGHT[ingredient.categoriaSlug] ?? 16;
      const position = currentHeight;
      currentHeight += height;
      return { ...ingredient, position, index };
    });
  }, [sorted]);

  const totalStackHeight = layersWithPosition.reduce(
    (sum, layer) => sum + (CATEGORY_HEIGHT[layer.categoriaSlug] ?? 16),
    60 // altura mínima base
  );

  return (
    <div
      className="burger-stack-container relative mx-auto w-full max-w-[340px] rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-950 p-4 shadow-inner shadow-black/30"
      style={{
        minHeight: Math.max(280, totalStackHeight + 120),
        perspective: '800px'
      }}
    >
      {/* Efeito de luz de fundo */}
      <div className="absolute inset-2 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.15),transparent_40%)]" />

      {/* Container com rotação 3D */}
      <div
        className="burger-3d-scene relative flex h-full w-full items-end justify-center pb-8"
        style={{
          minHeight: Math.max(240, totalStackHeight + 80),
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Sombra do hambúrguer */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/30 blur-xl"
          style={{
            width: containerWidth * 0.7,
            height: 20,
          }}
        />

        {/* Stack de ingredientes com rotação 3D */}
        <div
          className="burger-layers relative"
          style={{
            width: containerWidth,
            height: totalStackHeight + 40,
            transformStyle: 'preserve-3d',
            animation: 'burgerRotate3D 10s ease-in-out infinite',
          }}
        >
          {/* Camadas dos ingredientes empilhadas */}
          {layersWithPosition.map((ingredient) => {
            const imageUrl = resolveAssetUrl(getIngredientImage(ingredient.slug));
            const size = resolveSize(ingredient.categoriaSlug, containerWidth);

            if (!imageUrl) {
              // Placeholder para ingredientes sem imagem
              return (
                <div
                  key={ingredient.id}
                  className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-lg bg-gradient-to-br from-amber-600/40 via-amber-700/30 to-amber-800/20 text-xs font-medium uppercase tracking-wide text-white/80 shadow-lg"
                  style={{
                    bottom: ingredient.position,
                    width: size,
                    height: 28,
                    zIndex: ingredient.index + 10,
                    animation: `layerFloat 2.5s ease-in-out ${ingredient.index * 0.12}s infinite`,
                  }}
                >
                  {ingredient.nome}
                </div>
              );
            }

            return (
              <img
                key={ingredient.id}
                src={imageUrl}
                alt={ingredient.nome}
                className="burger-layer absolute left-1/2 -translate-x-1/2 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
                style={{
                  bottom: ingredient.position,
                  width: size,
                  zIndex: ingredient.index + 10,
                  animation: `layerFloat 2.5s ease-in-out ${ingredient.index * 0.12}s infinite, layerSlideIn 0.35s ease-out ${ingredient.index * 0.08}s both`,
                }}
                loading="lazy"
              />
            );
          })}
        </div>

        {/* Mensagem quando vazio */}
        {ingredients.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-4 animate-bounce">🍔</div>
            <p className="text-base font-medium text-white/70">Monte seu hambúrguer</p>
            <p className="text-sm text-white/50 mt-1">Selecione os ingredientes ao lado</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes burgerRotate3D {
          0%, 100% {
            transform: rotateY(-12deg) rotateX(8deg);
          }
          50% {
            transform: rotateY(12deg) rotateX(8deg);
          }
        }

        @keyframes layerFloat {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-3px);
          }
        }

        @keyframes layerSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(30px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
