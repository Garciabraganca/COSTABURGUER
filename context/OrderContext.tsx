"use client";

import React, { createContext, useContext, useMemo, useState } from 'react';
import { EXTRAS, OPTIONS, STEPS } from '@/lib/menuData';
import { getIngredientePorId } from '@/lib/ingredientsData';

export type StepOption = {
  id: string;
  nome: string;
  desc?: string;
  preco: number;
};

export type BurgerItem = {
  id: string;
  nome: string;
  camadas: Record<string, StepOption>;
  preco: number;
  ingredientes?: string[]; // Lista de IDs de ingredientes para burgers customizados
};

export type CustomerData = {
  nome?: string;
  celular?: string;
  rua?: string;
  bairro?: string;
  complemento?: string;
  referencia?: string;
  tipoEntrega?: 'ENTREGA' | 'RETIRADA';
};

export type OrderItem = {
  nome: string;
  preco: number;
  camadas?: Record<string, StepOption>;
  selecionados?: string[];
};

export type OrderPayload = {
  nome: string;
  celular: string;
  endereco: string;
  tipoEntrega: string;
  total: number;
  itens: OrderItem[];
};

type OrderContextValue = {
  steps: typeof STEPS;
  options: typeof OPTIONS;
  extras: typeof EXTRAS;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  selections: Record<string, StepOption | undefined>;
  selectOption: (stepId: string, option: StepOption) => void;
  addCurrentBurgerToCart: () => void;
  addCustomBurgerToCart: (ingredientes: string[], preco: number) => void;
  cart: BurgerItem[];
  removeCartItem: (id: string) => void;
  extrasSelecionados: string[];
  toggleExtra: (id: string) => void;
  cartSubtotal: number;
  deliveryFee: number;
  currencyFormat: (value: number) => string;
  partialTotal: number;
  customer: CustomerData;
  updateCustomer: (data: CustomerData) => void;
  buildOrderPayload: () => OrderPayload;
  resetAfterOrder: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

const currencyFormat = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, StepOption | undefined>>({});
  const [cart, setCart] = useState<BurgerItem[]>([]);
  const [extrasSelecionados, setExtrasSelecionados] = useState<string[]>([]);
  const [customer, setCustomer] = useState<CustomerData>({ tipoEntrega: 'ENTREGA' });

  const partialTotal = useMemo(
    () => Object.values(selections).reduce((acc, opt) => acc + (opt?.preco || 0), 0),
    [selections]
  );

  const extrasTotal = useMemo(
    () =>
      EXTRAS.filter((extra) => extrasSelecionados.includes(extra.id)).reduce(
        (acc, extra) => acc + extra.preco,
        0
      ),
    [extrasSelecionados]
  );

  const cartSubtotal = useMemo(() => {
    const base = cart.reduce((acc, item) => acc + item.preco, 0);
    return base + extrasTotal;
  }, [cart, extrasTotal]);

  const deliveryFee = cart.length > 0 ? 7 : 0;

  function selectOption(stepId: string, option: StepOption) {
    setSelections((prev) => ({ ...prev, [stepId]: option }));
  }

  function resetSelections() {
    setSelections({});
    setCurrentStepIndex(0);
  }

  function addCurrentBurgerToCart() {
    const missingStep = STEPS.find((step) => !selections[step.id]);
    if (missingStep) {
      throw new Error(`Você ainda não escolheu a camada: ${missingStep.label}`);
    }

    const total = Object.values(selections).reduce((acc, opt) => acc + (opt?.preco || 0), 0);
    const item: BurgerItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      nome: 'Meu Burger em Camadas',
      camadas: { ...selections },
      preco: total,
    };
    setCart((prev) => [...prev, item]);
    resetSelections();
  }

  function addCustomBurgerToCart(ingredientes: string[], preco: number) {
    // Monta descrição dos ingredientes
    const nomes = ingredientes
      .map(id => getIngredientePorId(id)?.nome)
      .filter(Boolean)
      .join(', ');

    const item: BurgerItem = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      nome: 'Burger Personalizado',
      camadas: {
        custom: {
          id: 'custom',
          nome: nomes || 'Personalizado',
          preco: preco,
        },
      },
      ingredientes: ingredientes,
      preco: preco,
    };
    setCart((prev) => [...prev, item]);
  }

  function removeCartItem(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function toggleExtra(id: string) {
    setExtrasSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function updateCustomer(data: CustomerData) {
    setCustomer((prev) => ({ ...prev, ...data }));
  }

  function buildOrderPayload(): OrderPayload {
    const nome = customer.nome?.trim() || 'Cliente Costa-Burger';
    const celular = customer.celular?.trim() || 'Sem número';
    const endereco = customer.tipoEntrega === 'RETIRADA'
      ? 'Retirada no balcão'
      : [customer.rua, customer.bairro, customer.complemento, customer.referencia]
          .filter(Boolean)
          .join(', ') || 'Endereço não informado';

    const itens: OrderItem[] = [
      ...cart.map((item) => ({
        nome: item.nome,
        preco: item.preco,
        camadas: item.camadas,
      })),
    ];

    if (extrasSelecionados.length > 0) {
      itens.push({
        nome: 'Extras',
        preco: extrasTotal,
        selecionados: extrasSelecionados,
      });
    }

    const total = cartSubtotal + deliveryFee;

    return {
      nome,
      celular,
      endereco,
      tipoEntrega: customer.tipoEntrega || 'ENTREGA',
      total,
      itens,
    };
  }

  function resetAfterOrder() {
    setCart([]);
    setExtrasSelecionados([]);
  }

  const value: OrderContextValue = {
    steps: STEPS,
    options: OPTIONS,
    extras: EXTRAS,
    currentStepIndex,
    setCurrentStepIndex,
    selections,
    selectOption,
    addCurrentBurgerToCart,
    addCustomBurgerToCart,
    cart,
    removeCartItem,
    extrasSelecionados,
    toggleExtra,
    cartSubtotal,
    deliveryFee,
    currencyFormat,
    partialTotal,
    customer,
    updateCustomer,
    buildOrderPayload,
    resetAfterOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder deve ser usado dentro de OrderProvider');
  }
  return context;
}
