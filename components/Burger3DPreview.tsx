/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from 'react';
import { CatalogCategorySlug } from '@/lib/assets/ingredientImages';

export type Layer3DIngredient = {
  id: string;
  slug: string;
  nome: string;
  categoriaSlug: CatalogCategorySlug;
  ordemCategoria?: number;
};

// Imagem do hambúrguer montado - atualize este caminho quando subir a imagem
const BURGER_IMAGE = '/burger-montado.png';

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
  rotationSpeed = 0.5,
  size = 320,
}: Props) {
  const [rotation, setRotation] = useState(0);
  const animationRef = useRef<number>();

  // Animação de rotação contínua
  useEffect(() => {
    if (!autoRotate || ingredients.length === 0) {
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
  }, [autoRotate, rotationSpeed, ingredients.length]);

  if (ingredients.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      {/* Container 3D */}
      <div
        className="relative mx-auto"
        style={{
          width: size,
          height: size,
          perspective: '1200px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        {/* Sombra embaixo */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-black/40 blur-2xl"
          style={{
            width: size * 0.6,
            height: size * 0.08,
            bottom: '5%',
          }}
        />

        {/* Hambúrguer girando */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotation}deg)`,
          }}
        >
          <img
            src={BURGER_IMAGE}
            alt="Seu hambúrguer montado"
            className="max-w-full max-h-full object-contain drop-shadow-2xl"
            style={{
              width: size * 0.85,
              height: 'auto',
              filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
            }}
            draggable={false}
            onError={(e) => {
              // Fallback se a imagem não existir
              (e.target as HTMLImageElement).src = '/ingredients/carnes/hamburguer.png';
            }}
          />
        </div>
      </div>

      {/* Indicador de ingredientes selecionados */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium text-emerald-400">
          {ingredients.length} ingrediente{ingredients.length !== 1 ? 's' : ''} selecionado{ingredients.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
