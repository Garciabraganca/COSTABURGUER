"use client";

import { SPRITE_SHEET_SIZE } from '@/lib/ingredientsData';

interface SpriteImageProps {
  sheet: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale?: number;
  className?: string;
  ariaLabel?: string;
}

export default function SpriteImage({
  sheet,
  x,
  y,
  width,
  height,
  scale = 0.45,
  className,
  ariaLabel,
}: SpriteImageProps) {
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  return (
    <div
      className={`sprite-image ${className || ''}`.trim()}
      role="img"
      aria-label={ariaLabel}
      style={{
        width: scaledWidth,
        height: scaledHeight,
        backgroundImage: `url(${sheet})`,
        backgroundPosition: `-${x * scale}px -${y * scale}px`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${SPRITE_SHEET_SIZE.width * scale}px ${SPRITE_SHEET_SIZE.height * scale}px`,
      }}
    />
  );
}
