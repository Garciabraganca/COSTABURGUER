'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { calcularPrecoTotal, getIngredientePorId } from '@/lib/ingredientsData';

type Step = { id: string; label: string };

type Option = { id: string; nome: string; desc: string; preco: number };

type CartItem = {
  id: string;
  nome: string;
  preco: number;
  camadas: Record<string, { id: string; nome: string }>;
  ingredientes: string[];
};

type Customer = {
  nome?: string;
  celular?: string;
  rua?: string;
  bairro?: string;
  complemento?: string;
  referencia?: string;
  tipoEntrega?: 'ENTREGA' | 'RETIRADA';
};

type OrderContextValue = {
  steps: Step[];
  currentStepIndex: number;
  setCurrentStepIndex: (idx: number) => void;
  options: Record<string, Option[]>;
  selections: Record<string, Option | null>;
  selectOption: (stepId: string, option: Option) => void;
  extras: { id: string; nome: string; preco: number }[];
  extrasSelecionados: string[];
  toggleExtra: (id: string) => void;

  cart: CartItem[];
  addCustomBurgerToCart: (ingredientes: string[], preco?: number) => void;
  removeCartItem: (id: string) => void;

  currencyFormat: (value: number) => string;
  cartSubtotal: number;
  deliveryFee: number;

  customer: Customer;
  updateCustomer: (data: Partial<Customer>) => void;
  buildOrderPayload: () => any;
  resetAfterOrder: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

const DEFAULT_STEPS: Step[] = [
  { id: 'pao', label: 'Pão' },
  { id: 'carne', label: 'Carne' },
  { id: 'queijo', label: 'Queijo' },
  { id: 'molho', label: 'Molho' },
];

const DEFAULT_OPTIONS: Record<string, Option[]> = {
  pao: [
    { id: 'pao-brioche', nome: 'Brioche', desc: 'Macio e levemente adocicado', preco: 0 },
    { id: 'pao-australiano', nome: 'Australiano', desc: 'Forte e marcante', preco: 4 },
  ],
  carne: [
    { id: 'blend-bovino-90', nome: 'Blend Bovino 90g', desc: 'Suculento e grelhado', preco: 8 },
    { id: 'frango-grelhado', nome: 'Frango', desc: 'Opção leve', preco: 7 },
  ],
  queijo: [
    { id: 'queijo-cheddar', nome: 'Cheddar', desc: 'Clássico', preco: 3 },
    { id: 'queijo-mussarela', nome: 'Mussarela', desc: 'Derretido', preco: 2.5 },
  ],
  molho: [
    { id: 'maionese', nome: 'Maionese', desc: 'Cremosa', preco: 0 },
    { id: 'barbecue', nome: 'Barbecue', desc: 'Defumado', preco: 1.5 },
  ],
};

const DEFAULT_EXTRAS = [
  { id: 'batata', nome: 'Batata frita', preco: 9 },
  { id: 'sobremesa', nome: 'Sobremesa do dia', preco: 7 },
  { id: 'refri-lata', nome: 'Refrigerante lata', preco: 6 },
  { id: 'refri-1l', nome: 'Refrigerante 1L', preco: 10 },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Option | null>>({});
  const [extrasSelecionados, setExtrasSelecionados] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer>({ tipoEntrega: 'ENTREGA' });

  const currencyFormat = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const selectOption = (stepId: string, option: Option) => {
    setSelections((prev) => ({ ...prev, [stepId]: option }));
  };

  const toggleExtra = (id: string) => {
    setExtrasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((extraId) => extraId !== id) : [...prev, id]
    );
  };

  const addCustomBurgerToCart = (ingredientes: string[], preco?: number) => {
    const camadas = ingredientes.reduce<Record<string, { id: string; nome: string }>>((acc, id) => {
      const ing = getIngredientePorId(id);
      if (ing) {
        acc[ing.category] = { id: ing.id, nome: ing.name };
      }
      return acc;
    }, {});

    const total = typeof preco === 'number' ? preco : calcularPrecoTotal(ingredientes);
    const item: CartItem = {
      id: uid(),
      nome: 'Burger personalizado',
      preco: total,
      camadas,
      ingredientes,
    };
    setCart((prev) => [...prev, item]);
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + item.preco, 0), [cart]);
  const deliveryFee = 8;

  const updateCustomer = (data: Partial<Customer>) => setCustomer((prev) => ({ ...prev, ...data }));

  const buildOrderPayload = () => ({
    items: cart,
    extras: extrasSelecionados,
    total: cartSubtotal + deliveryFee,
    customer,
  });

  const resetAfterOrder = () => {
    setCart([]);
    setSelections({});
    setExtrasSelecionados([]);
    setCurrentStepIndex(0);
  };

  const value: OrderContextValue = {
    steps: DEFAULT_STEPS,
    currentStepIndex,
    setCurrentStepIndex,
    options: DEFAULT_OPTIONS,
    selections,
    selectOption,
    extras: DEFAULT_EXTRAS,
    extrasSelecionados,
    toggleExtra,
    cart,
    addCustomBurgerToCart,
    removeCartItem,
    currencyFormat,
    cartSubtotal,
    deliveryFee,
    customer,
    updateCustomer,
    buildOrderPayload,
    resetAfterOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used inside <OrderProvider>');
  return ctx;
}
