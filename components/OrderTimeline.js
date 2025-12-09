const steps = [
  'Pedido confirmado',
  'Cozinha preparando',
  'Saiu para entrega',
  'Entregue',
];

export default function OrderTimeline({ currentStatus = 1 }) {
  return (
    <ol className="timeline">
      {steps.map((label, index) => {
        const stepIndex = index + 1;
        const className = stepIndex < currentStatus ? 'done' : stepIndex === currentStatus ? 'current' : '';
        return (
          <li key={label} className={className}>
            {label}
          </li>
        );
      })}
    </ol>
  );
}
