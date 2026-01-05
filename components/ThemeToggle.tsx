"use client";

import { Moon, Sun } from 'lucide-react';
import { useThemeMode } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { mode, toggle } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-label={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="hidden text-sm font-semibold sm:inline">Modo {isDark ? 'claro' : 'escuro'}</span>
    </button>
  );
}
