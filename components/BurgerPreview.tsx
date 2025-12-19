"use client";

import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './BurgerPreview.module.css';

type BurgerPreviewMode = 'build' | 'final';

type BurgerPreviewProps = {
  mode: BurgerPreviewMode;
  interactive?: boolean;
  className?: string;
};

const MAX_TILT = 6;

export function BurgerPreview({ mode, interactive = false, className }: BurgerPreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (!interactive || mode !== 'final' || prefersReducedMotion) return;
    const stage = stageRef.current;
    if (!stage) return;

    let frame: number | null = null;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const scheduleUpdate = () => {
      if (frame != null) return;
      frame = requestAnimationFrame(() => {
        stage.style.setProperty('--tiltX', `${currentTiltX}deg`);
        stage.style.setProperty('--tiltY', `${currentTiltY}deg`);
        frame = null;
      });
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      currentTiltY = Math.max(-MAX_TILT, Math.min(MAX_TILT, x * MAX_TILT * 2));
      currentTiltX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -y * MAX_TILT * 2));
      scheduleUpdate();
    };

    const resetTilt = () => {
      currentTiltX = 0;
      currentTiltY = 0;
      scheduleUpdate();
    };

    stage.addEventListener('pointermove', handlePointerMove);
    stage.addEventListener('pointerleave', resetTilt);

    return () => {
      stage.removeEventListener('pointermove', handlePointerMove);
      stage.removeEventListener('pointerleave', resetTilt);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [interactive, mode, prefersReducedMotion]);

  const depthLayers = useMemo(() => {
    const layers = 12;
    return Array.from({ length: layers }).map((_, index) => {
      const depth = index * 2.4;
      const opacity = Math.max(0, 1 - index * 0.045);
      return (
        <div
          key={index}
          className={styles.depthLayer}
          style={{ transform: `translateZ(${-depth}px)`, opacity }}
          aria-hidden
        >
          <Image
            src="/burger-montado.png"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 70vw, 420px"
            className={styles.depthImage}
            draggable={false}
          />
        </div>
      );
    });
  }, []);

  return (
    <div className={cn(styles.wrapper, className)} data-mode={mode}>
      <div className={styles.stage} ref={stageRef} data-interactive={interactive && mode === 'final'}>
        <div className={styles.shadow} aria-hidden />
        <div className={styles.rimLight} aria-hidden />
        <div className={styles.highlight} aria-hidden />
        <div className={styles.glow} aria-hidden />
        <div className={styles.stack}>
          {depthLayers}
          <Image
            src="/burger-montado.png"
            alt="Hambúrguer premium"
            fill
            priority
            sizes="(max-width: 768px) 70vw, 420px"
            className={styles.mainImage}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

export default BurgerPreview;
