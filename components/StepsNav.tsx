"use client";

import { useOrder } from '@/context/OrderContext';

export default function StepsNav() {
  const { steps, currentStepIndex, setCurrentStepIndex } = useOrder();

  return (
    <div className="steps-nav">
      {steps.map((step, index) => (
        <button
          key={step.id}
          className={`step-pill${index === currentStepIndex ? ' active' : ''}`}
          onClick={() => setCurrentStepIndex(index)}
        >
          {index + 1}. {step.label}
        </button>
      ))}
    </div>
  );
}
