"use client";

import { OrderProvider } from '@/context/OrderContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <OrderProvider>{children}</OrderProvider>;
}
