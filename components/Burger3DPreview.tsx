/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { HAMBURGER_BASE_IMAGE, getIngredientImage, CatalogCategorySlug } from '@/lib/assets/ingredientImages';
import { cn, resolveAssetUrl } from '@/lib/utils';

export type Layer3DIngredient = {
  id: string;
  slug: string;
  nome: string;
  categoriaSlug: CatalogCategorySlug;
  ordemCategoria?: number;
};

// Configuração de camadas para efeito 3D
const LAYER_CONFIG: Record<CatalogCategorySlug, {
  zOffset: number;      // Profundidade Z (pixels)
  sizeRatio: number;    // Tamanho relativo (0-1)
  yOffset: number;      // Offset vertical (pixels)
  thickness: number;    // "Espessura" visual
}> = {
  pao: { zOffset: 0, sizeRatio: 0.95, yOffset: -80, thickness: 20 },
  extras: { zOffset: 15, sizeRatio: 0.82, yOffset: -50, thickness: 12 },
  vegetais: { zOffset: 25, sizeRatio: 0.85, yOffset: -30, thickness: 8 },
  queijo: { zOffset: 35, sizeRatio: 0.88, yOffset: -15, thickness: 6 },
  carne: { zOffset: 45, sizeRatio: 0.90, yOffset: 5, thickness: 18 },
  molho: { zOffset: 55, sizeRatio: 0.75, yOffset: 25, thickness: 4 },
  especial: { zOffset: 20, sizeRatio: 0.80, yOffset: -40, thickness: 10 },
};

// Ordem das camadas de cima para baixo
const CATEGORY_ORDER: CatalogCategorySlug[] = [
  'pao',
  'extras',
  'especial',
  'vegetais',
  'queijo',
  'carne',
  'molho',
];

type Props = {
  ingredients: Layer3DIngredient[];
  autoRotate?: boolean;
  rotationSpeed?: number;
  size?: number;
  showControls?: boolean;
};

export function Burger3DPreview({
  ingredients,
  autoRotate = true,
  rotationSpeed = 0.3,
  size = 320,
  showControls = true,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const lastX = useRef(0);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Ordena ingredientes por categoria
  const sortedIngredients = [...ingredients].sort((a, b) => {
    const orderA = CATEGORY_ORDER.indexOf(a.categoriaSlug);
    const orderB = CATEGORY_ORDER.indexOf(b.categoriaSlug);
    return orderA - orderB;
  });

  // Animação de rotação
  useEffect(() => {
    if (!autoRotate || isPaused || isDragging) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      setRotation((prev) => (prev + rotationSpeed) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [autoRotate, isPaused, isDragging, rotationSpeed]);

  // Handlers para arrastar
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastX.current;
    setRotation((prev) => (prev + deltaX * 0.5) % 360);
    lastX.current = e.clientX;
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Calcula stack dinâmico baseado nos ingredientes
  const stackLayers = sortedIngredients.map((ingredient, index) => {
    const config = LAYER_CONFIG[ingredient.categoriaSlug] || LAYER_CONFIG.extras;
    const imageUrl = resolveAssetUrl(getIngredientImage(ingredient.slug));
    const layerSize = size * config.sizeRatio;

    // Calcula offset Y baseado na posição na pilha
    const dynamicYOffset = config.yOffset + (index * 12);

    return {
      ...ingredient,
      imageUrl,
      size: layerSize,
      zOffset: config.zOffset + (index * 8),
      yOffset: dynamicYOffset,
      thickness: config.thickness,
    };
  });

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Container 3D */}
      <div
        ref={containerRef}
        className={cn(
          "relative cursor-grab select-none",
          isDragging && "cursor-grabbing"
        )}
        style={{
          width: size,
          height: size,
          perspective: '1000px',
          perspectiveOrigin: '50% 50%',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Palco 3D rotacionável */}
        <div
          className="absolute inset-0 transition-transform duration-75"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg) rotateX(15deg)`,
          }}
        >
          {/* Base/sombra do hambúrguer */}
          <div
            className="absolute left-1/2 rounded-full bg-black/30 blur-xl"
            style={{
              width: size * 0.7,
              height: size * 0.15,
              transform: `translateX(-50%) translateZ(-60px) translateY(${size * 0.35}px) rotateX(90deg)`,
            }}
          />

          {/* Imagem base (hambúrguer completo para referência) */}
          {sortedIngredients.length === 0 && (
            <img
              src={resolveAssetUrl(HAMBURGER_BASE_IMAGE) || ''}
              alt="Hambúrguer base"
              className="absolute left-1/2 top-1/2 opacity-40"
              style={{
                width: size * 0.75,
                height: 'auto',
                transform: 'translate(-50%, -50%) translateZ(0px)',
              }}
            />
          )}

          {/* Camadas do hambúrguer */}
          {stackLayers.map((layer, index) => (
            <div
              key={layer.id}
              className="absolute left-1/2 top-1/2"
              style={{
                width: layer.size,
                height: 'auto',
                transform: `
                  translateX(-50%)
                  translateY(calc(-50% + ${layer.yOffset}px))
                  translateZ(${layer.zOffset}px)
                `,
                filter: `drop-shadow(0 ${4 + index * 2}px ${8 + index * 4}px rgba(0,0,0,0.4))`,
                transformStyle: 'preserve-3d',
              }}
            >
              {layer.imageUrl ? (
                <img
                  src={layer.imageUrl}
                  alt={layer.nome}
                  className="w-full h-auto"
                  style={{
                    backfaceVisibility: 'hidden',
                  }}
                  draggable={false}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full bg-gradient-to-br from-amber-500/60 to-orange-600/60 text-xs font-medium text-white shadow-lg"
                  style={{
                    width: layer.size,
                    height: layer.size * 0.3,
                  }}
                >
                  {layer.nome}
                </div>
              )}

              {/* Efeito de "espessura" - lado da camada */}
              <div
                className="absolute left-0 w-full bg-gradient-to-b from-amber-900/50 to-amber-950/70 rounded-b-lg"
                style={{
                  height: layer.thickness,
                  bottom: -layer.thickness / 2,
                  transform: `translateZ(-${layer.thickness / 2}px) rotateX(-90deg)`,
                  transformOrigin: 'top center',
                }}
              />
            </div>
          ))}

          {/* Pão inferior (sempre presente se tiver ingredientes) */}
          {sortedIngredients.length > 0 && (
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                width: size * 0.9,
                transform: `
                  translateX(-50%)
                  translateY(calc(-50% + 70px))
                  translateZ(70px)
                  rotateX(180deg)
                `,
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
              }}
            >
              <img
                src={resolveAssetUrl(getIngredientImage('pao-brioche')) || ''}
                alt="Pão inferior"
                className="w-full h-auto"
                style={{
                  backfaceVisibility: 'hidden',
                }}
                draggable={false}
              />
            </div>
          )}
        </div>

        {/* Indicador de rotação */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs text-white/50">
          <span className="animate-pulse">↻</span>
          <span>Arraste para girar</span>
        </div>
      </div>

      {/* Controles */}
      {showControls && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition",
              isPaused
                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            )}
          >
            {isPaused ? '▶ Girar' : '⏸ Pausar'}
          </button>
          <button
            onClick={() => setRotation(0)}
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/20"
          >
            ↺ Reset
          </button>
        </div>
      )}

      {/* Info de ingredientes */}
      {sortedIngredients.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-white/50">
            {sortedIngredients.length} camada{sortedIngredients.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
