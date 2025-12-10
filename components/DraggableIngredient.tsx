"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Ingredient } from '@/lib/ingredientsData';

type Props = {
  ingredient: Ingredient;
  currencyFormat: (value: number) => string;
};

export default function DraggableIngredient({ ingredient, currencyFormat }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ingredient.id,
    data: ingredient,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="ingredient-card"
    >
      <div className="ingredient-image-container">
        <Image
          src={ingredient.image}
          alt={ingredient.name}
          width={80}
          height={80}
          style={{ objectFit: 'contain' }}
          unoptimized
        />
      </div>
      <div className="ingredient-info">
        <span className="ingredient-name">{ingredient.name}</span>
        <span className="ingredient-price">
          {ingredient.price > 0 ? `+ ${currencyFormat(ingredient.price)}` : 'Incluso'}
        </span>
      </div>
    </div>
  );
}
