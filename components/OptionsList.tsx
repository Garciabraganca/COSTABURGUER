"use client";

import { useOrder } from '@/context/OrderContext';

export default function OptionsList() {
  const { steps, currentStepIndex, options, selections, selectOption, currencyFormat } = useOrder();
  const step = steps[currentStepIndex];
  const stepOptions = options[step.id];
  const selectionsForStep = selections[step.id];

  return (
    <div className="options-list">
      {stepOptions.map((opt) => (
        <div
          key={opt.id}
          className={`option-card${selectionsForStep?.id === opt.id ? ' selected' : ''}`}
          onClick={() => selectOption(step.id, opt)}
        >
          <div className="option-title">{opt.nome}</div>
          <div className="option-desc">{opt.desc}</div>
          <div className="option-price">{opt.preco > 0 ? `+ ${currencyFormat(opt.preco)}` : 'Incluso'}</div>
        </div>
      ))}
    </div>
  );
}
