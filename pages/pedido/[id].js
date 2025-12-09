import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import OrderTimeline from '../../components/OrderTimeline';
import { useOrder } from '../../context/OrderContext';

export default function PedidoDetalhe() {
  const router = useRouter();
  const { id } = router.query;
  const { statusMap, advanceOrderStatus } = useOrder();
  const [estimatedTime, setEstimatedTime] = useState('~35–45 min');

  useEffect(() => {
    if (!id) return;
    setEstimatedTime('~35–45 min');
  }, [id]);

  const currentStatus = statusMap[id] || 1;

  return (
    <Layout>
      <section className="screen active">
        <div className="step-header">
          <h2>Acompanhar pedido</h2>
        </div>

        <div className="order-status">
          <p>
            <strong>Pedido:</strong> <span>{id ? `COSTA-${id}` : 'COSTA-XXXX'}</span>
          </p>
          <p>
            <strong>Tempo estimado:</strong> {estimatedTime}
          </p>
        </div>

        <OrderTimeline currentStatus={currentStatus} />

        <div className="map-placeholder">
          <p>Mapa de rastreamento em tempo real (placeholder).</p>
          <p>Base pronta para integrar WebSocket/Supabase com posição do motoboy.</p>
        </div>

        <div className="bottom-bar">
          <button className="btn ghost" onClick={() => advanceOrderStatus(id)}>
            Simular avanço status
          </button>
        </div>
      </section>
    </Layout>
  );
}
