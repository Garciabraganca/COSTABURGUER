"use client";

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Ingredient, SPRITE_SHEET_SIZE } from '@/lib/ingredientsData';

type Props = {
  ingredient: Ingredient;
  currencyFormat: (value: number) => string;
};

export default function DraggableIngredient({ ingredient, currencyFormat }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ingredient.id,
    data: ingredient,
  });

  const previewScale = 0.45;
  const previewWidth = ingredient.width * previewScale;
  const previewHeight = ingredient.height * previewScale;

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
      <div
        className="ingredient-sprite"
        style={{
          width: previewWidth,
          height: previewHeight,
          backgroundImage: `url(${ingredient.sheet})`,
          backgroundPosition: `-${ingredient.x * previewScale}px -${ingredient.y * previewScale}px`,
          backgroundSize: `${SPRITE_SHEET_SIZE.width * previewScale}px ${SPRITE_SHEET_SIZE.height * previewScale}px`,
        }}
      />
      <div className="ingredient-info">
        <span className="ingredient-name">{ingredient.name}</span>
        <span className="ingredient-price">
          {ingredient.price > 0 ? `+ ${currencyFormat(ingredient.price)}` : 'Incluso'}
        </span>
      </div>
    </div>
  );
}
