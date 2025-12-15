"use client";

import { useMemo } from 'react';
import { Ingredient, IngredientCategory, CATEGORIAS } from '@/lib/ingredientsData';
import { resolveAssetUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

const CATEGORY_ORDER: IngredientCategory[] = ['pao', 'molho', 'carne', 'queijo', 'vegetal', 'extra', 'especial'];

const CATEGORY_GRADIENTS: Record<IngredientCategory, string> = {
  pao: 'from-amber-300 via-amber-200 to-amber-400',
  molho: 'from-pink-400 via-rose-400 to-orange-300',
  carne: 'from-red-500 via-orange-500 to-amber-500',
  queijo: 'from-amber-200 via-yellow-300 to-orange-200',
  vegetal: 'from-emerald-400 via-green-400 to-lime-300',
  extra: 'from-cyan-400 via-sky-400 to-blue-400',
  especial: 'from-purple-400 via-fuchsia-400 to-pink-400',
};

type BurgerStackPreviewProps = {
  ingredients: Ingredient[];
};

export function BurgerStackPreview({ ingredients }: BurgerStackPreviewProps) {
  const ordered = useMemo(
    () =>
      [...ingredients].sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(a.category);
        const bIndex = CATEGORY_ORDER.indexOf(b.category);
        return aIndex - bIndex;
      }),
    [ingredients]
  );

  const legend = ordered.map((ing) => ing.name).join(' + ');

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30 backdrop-blur">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
        <span>Montagem em camadas</span>
        <span>{ordered.length > 0 ? `${ordered.length} itens` : 'vazio'}</span>
      </div>

      <div className="relative isolate flex flex-col items-stretch gap-2 rounded-xl bg-gradient-to-b from-white/5 via-white/0 to-white/5 px-4 py-6">
        {ordered.length === 0 && (
          <div className="flex flex-col items-center gap-2 text-sm text-white/60">
            <div className="h-16 w-16 rounded-full bg-white/5 text-3xl shadow-inner shadow-black/20">🍔</div>
            <p className="text-center">Nenhum ingrediente adicionado</p>
          </div>
        )}

        {ordered.map((ingredient, index) => {
          const backgroundImage = resolveAssetUrl(ingredient.image);
          return (
            <div
              key={`${ingredient.id}-${index}`}
              className={cn(
                'relative h-6 rounded-full border border-white/10 shadow-lg shadow-black/20 transition hover:-translate-y-[2px] hover:border-white/30',
                `bg-gradient-to-r ${CATEGORY_GRADIENTS[ingredient.category]}`
              )}
              style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
              <div className="absolute inset-0 rounded-full bg-white/10 mix-blend-overlay" aria-hidden />
            </div>
          );
        })}

        {ordered.length > 0 && (
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
            <span className="uppercase tracking-[0.15em] text-white/50">Stack</span>
            <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] font-semibold text-white/80">
              {legend.length > 70 ? `${legend.slice(0, 70)}…` : legend}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-white/60">
        {CATEGORY_ORDER.map((cat) => (
          <div key={cat} className="flex items-center gap-1 rounded-lg border border-white/5 bg-white/5 px-2 py-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORIAS[cat].cor }} />
            <span className="truncate">{CATEGORIAS[cat].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
