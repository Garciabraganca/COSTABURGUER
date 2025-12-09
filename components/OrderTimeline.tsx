"use client";

const steps = [
  { label: 'Pedido confirmado', status: 'CONFIRMADO' },
  { label: 'Cozinha preparando', status: 'PREPARANDO' },
  { label: 'Saiu para entrega', status: 'EM_ENTREGA' },
  { label: 'Entregue', status: 'ENTREGUE' },
];

export type OrderStatus = (typeof steps)[number]['status'];

export default function OrderTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  const currentIndex = Math.max(steps.findIndex((step) => step.status === currentStatus), 0);
  return (
    <ol className="timeline">
      {steps.map((step, index) => {
        const className =
          index < currentIndex ? 'done' : index === currentIndex ? 'current' : '';
        return (
          <li key={step.status} className={className}>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
