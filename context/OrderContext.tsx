'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

type Step = { id: string; label: string };

type Option = { id: string; nome: string; desc: string; preco: number };

// Tipo para ingredientes vindos do catálogo (banco de dados)
export type CartIngredient = {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  categoriaSlug: string;
};

type CartItem = {
  id: string;
  nome: string;
  precoUnitario: number;
  precoTotal: number;
  quantidade: number;
  camadas: Record<string, { id: string; nome: string }>;
  ingredientes: CartIngredient[];
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
  addCustomBurgerToCart: (payload: {
    ingredientes: CartIngredient[];
    precoUnitario?: number;
    quantidade?: number;
  }) => void;
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

  const addCustomBurgerToCart = ({ ingredientes, precoUnitario, quantidade }: {
    ingredientes: CartIngredient[];
    precoUnitario?: number;
    quantidade?: number;
  }) => {
    // Agrupa ingredientes por categoria para exibição
    const camadas = ingredientes.reduce<Record<string, { id: string; nome: string }>>((acc, ing) => {
      // Usa categoriaSlug como chave (pode ter múltiplos ingredientes por categoria)
      const key = ing.categoriaSlug;
      // Se já existe um ingrediente dessa categoria, concatena os nomes
      if (acc[key]) {
        acc[key] = { id: acc[key].id + ',' + ing.id, nome: acc[key].nome + ', ' + ing.nome };
      } else {
        acc[key] = { id: ing.id, nome: ing.nome };
      }
      return acc;
    }, {});

    const unitValue = typeof precoUnitario === 'number' ? precoUnitario : ingredientes.reduce((sum, ing) => sum + ing.preco, 0);
    const qty = Math.max(1, quantidade || 1);
    const item: CartItem = {
      id: uid(),
      nome: 'Burger personalizado',
      precoUnitario: unitValue,
      precoTotal: unitValue * qty,
      quantidade: qty,
      camadas,
      ingredientes,
    };
    setCart((prev) => [...prev, item]);
  };

  const removeCartItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + item.precoTotal, 0), [cart]);
  const deliveryFee = 8;

  const updateCustomer = (data: Partial<Customer>) => setCustomer((prev) => ({ ...prev, ...data }));

  const buildOrderPayload = () => ({
    nome: customer.nome || 'Cliente',
    celular: customer.celular || '',
    endereco: [customer.rua, customer.bairro, customer.complemento, customer.referencia].filter(Boolean).join(', '),
    tipoEntrega: customer.tipoEntrega || 'ENTREGA',
    burger: {
      nome: 'Burger personalizado',
      quantidade: cart.reduce((total, item) => total + item.quantidade, 0) || 1,
      ingredientes: cart.flatMap((item, idx) =>
        item.ingredientes.map((ing, orderIndex) => ({
          ingredienteId: ing.id,
          slug: ing.slug,
          quantidade: item.quantidade,
          orderIndex: orderIndex + idx
        }))
      ),
    },
    acompanhamentos: extrasSelecionados.map((id) => ({ acompanhamentoId: id, quantidade: 1 })),
    observacoes: customer.referencia,
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
