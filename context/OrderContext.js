import React, { createContext, useContext, useMemo, useState } from 'react';
import { STEPS, OPTIONS, EXTRAS } from '../lib/menuData';

const OrderContext = createContext();

const currencyFormat = (value) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function OrderProvider({ children }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [cart, setCart] = useState([]);
  const [extrasSelecionados, setExtrasSelecionados] = useState(new Set());
  const [customer, setCustomer] = useState({});
  const [statusMap, setStatusMap] = useState({});

  const partialTotal = useMemo(
    () =>
      Object.values(selections).reduce((acc, opt) => acc + (opt?.preco || 0), 0),
    [selections]
  );

  const cartSubtotal = useMemo(() => {
    const base = cart.reduce((acc, item) => acc + item.preco, 0);
    const extrasTotal = EXTRAS.filter((extra) => extrasSelecionados.has(extra.id)).reduce(
      (acc, extra) => acc + extra.preco,
      0
    );
    return base + extrasTotal;
  }, [cart, extrasSelecionados]);

  const deliveryFee = cart.length > 0 ? 7 : 0;

  function selectOption(stepId, option) {
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

    const total = Object.values(selections).reduce((acc, opt) => acc + opt.preco, 0);
    const item = {
      id: Date.now(),
      nome: 'Meu Burger em Camadas',
      camadas: { ...selections },
      preco: total,
    };
    setCart((prev) => [...prev, item]);
    resetSelections();
  }

  function removeCartItem(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function toggleExtra(id) {
    setExtrasSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateCustomer(data) {
    setCustomer((prev) => ({ ...prev, ...data }));
  }

  async function createOrderOnServer(payload) {
    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Erro ao criar pedido');
    }

    const data = await response.json();
    setStatusMap((prev) => ({ ...prev, [data.id]: 1 }));
    return data;
  }

  function advanceOrderStatus(orderId) {
    setStatusMap((prev) => {
      const current = prev[orderId] || 1;
      if (current >= 4) return prev;
      return { ...prev, [orderId]: current + 1 };
    });
  }

  const value = {
    steps: STEPS,
    options: OPTIONS,
    extras: EXTRAS,
    currentStepIndex,
    setCurrentStepIndex,
    selections,
    selectOption,
    addCurrentBurgerToCart,
    cart,
    removeCartItem,
    toggleExtra,
    extrasSelecionados,
    cartSubtotal,
    deliveryFee,
    currencyFormat,
    partialTotal,
    customer,
    updateCustomer,
    createOrderOnServer,
    statusMap,
    advanceOrderStatus,
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
