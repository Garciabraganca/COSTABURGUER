"use client";

import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

export default function IngredientImage({ src, alt, size = 100, className = '' }: Props) {
  return (
    <div
      className={`ingredient-image ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        unoptimized
      />
    </div>
  );
}
