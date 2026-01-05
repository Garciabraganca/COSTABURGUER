"use client";

import { OrderProvider } from '@/context/OrderContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OrderProvider>{children}</OrderProvider>
    </ThemeProvider>
  );
}
