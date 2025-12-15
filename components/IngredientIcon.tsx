"use client";

import Image from 'next/image';
import { useState } from 'react';
import { cn, resolveAssetUrl } from '@/lib/utils';
import { CatalogCategorySlug } from '@/lib/assets/ingredientImages';

const CATEGORY_EMOJIS: Record<CatalogCategorySlug, string> = {
  pao: '🍞',
  carne: '🥩',
  queijo: '🧀',
  molho: '🥫',
  vegetais: '🥬',
  extras: '✨',
  especial: '⭐',
};

type IngredientIconProps = {
  src?: string | null;
  alt: string;
  category: CatalogCategorySlug;
  size?: number;
  className?: string;
};

export function IngredientIcon({ src, alt, category, size = 64, className }: IngredientIconProps) {
  const [failed, setFailed] = useState(false);
  const url = resolveAssetUrl(src);
  const fallbackEmoji = CATEGORY_EMOJIS[category] ?? '🍔';

  const showImage = !!url && !failed;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl shadow-inner shadow-black/20 backdrop-blur',
        className
      )}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      {showImage ? (
        <Image
          src={url}
          alt={alt}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
          unoptimized
        />
      ) : (
        <span className="select-none" aria-hidden>
          {fallbackEmoji}
        </span>
      )}
    </div>
  );
}
