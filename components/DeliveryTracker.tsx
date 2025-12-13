'use client';

import { useState, useEffect, useCallback } from 'react';

interface DeliveryTrackerProps {
  pedidoId: string;
}

interface Entrega {
  id: string;
  token: string;
  status: string;
  motoboyNome?: string;
  latitudeAtual?: number;
  longitudeAtual?: number;
  ultimaAtualizacao?: string;
}

const STATUS_CONFIG: Record<string, { label: string; cor: string; emoji: string }> = {
  AGUARDANDO: { label: 'Aguardando motoboy', cor: '#f39c12', emoji: '⏳' },
  A_CAMINHO: { label: 'Motoboy a caminho', cor: '#3498db', emoji: '🏍️' },
  CHEGANDO: { label: 'Chegando!', cor: '#9b59b6', emoji: '📍' },
  ENTREGUE: { label: 'Entregue', cor: '#27ae60', emoji: '✅' }
};

export default function DeliveryTracker({ pedidoId }: DeliveryTrackerProps) {
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const carregarEntrega = useCallback(async () => {
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/despachar`);
      if (res.ok) {
        const data = await res.json();
        setEntrega(data.entrega);
      }
    } catch (error) {
      console.error('Erro ao carregar entrega:', error);
    } finally {
      setLoading(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    carregarEntrega();
  }, [carregarEntrega]);

  // Conectar ao stream SSE quando tiver entrega
  useEffect(() => {
    if (!entrega?.token) return;

    const eventSource = new EventSource(`/api/delivery/${entrega.token}/stream`);

    eventSource.addEventListener('connected', () => {
      setConnected(true);
    });

    eventSource.addEventListener('location', (e) => {
      const data = JSON.parse(e.data);
      setEntrega(prev => prev ? {
        ...prev,
        latitudeAtual: data.latitude,
        longitudeAtual: data.longitude,
        ultimaAtualizacao: data.timestamp,
        status: data.status || prev.status
      } : null);
    });

    eventSource.addEventListener('completed', () => {
      setEntrega(prev => prev ? { ...prev, status: 'ENTREGUE' } : null);
      eventSource.close();
    });

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [entrega?.token]);

  if (loading) {
    return (
      <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem', textAlign: 'center' }}>
        Carregando informações de entrega...
      </div>
    );
  }

  if (!entrega) {
    return null; // Não mostrar nada se não houver entrega
  }

  const config = STATUS_CONFIG[entrega.status] || { label: entrega.status, cor: '#888', emoji: '📦' };

  const formatarHora = (data?: string) => {
    if (!data) return '';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const abrirMapa = () => {
    if (entrega.latitudeAtual && entrega.longitudeAtual) {
      const url = `https://www.google.com/maps?q=${entrega.latitudeAtual},${entrega.longitudeAtual}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      borderRadius: '0.75rem',
      padding: '1rem',
      color: '#fff',
      marginTop: '1rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          🛵 Rastreamento da Entrega
        </h3>
        <div style={{
          fontSize: '0.75rem',
          color: connected ? '#27ae60' : '#888'
        }}>
          {connected ? '● Ao vivo' : '○ Conectando...'}
        </div>
      </div>

      {/* Status da entrega */}
      <div style={{
        background: config.cor,
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{config.emoji}</span>
        <div>
          <div style={{ fontWeight: 'bold' }}>{config.label}</div>
          {entrega.motoboyNome && (
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              Motoboy: {entrega.motoboyNome}
            </div>
          )}
        </div>
      </div>

      {/* Localização */}
      {entrega.latitudeAtual && entrega.longitudeAtual && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#888', marginBottom: '0.5rem' }}>
            Última atualização: {formatarHora(entrega.ultimaAtualizacao)}
          </div>

          {/* Mapa simplificado (imagem estática do OpenStreetMap) */}
          <div
            onClick={abrirMapa}
            style={{
              background: '#3a3a3a',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: '100%',
              height: '150px',
              background: `url(https://staticmap.openstreetmap.de/staticmap.php?center=${entrega.latitudeAtual},${entrega.longitudeAtual}&zoom=15&size=400x150&maptype=mapnik&markers=${entrega.latitudeAtual},${entrega.longitudeAtual},red-pushpin)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '0.25rem',
              marginBottom: '0.5rem'
            }} />
            <div style={{ fontSize: '0.875rem', color: '#3498db' }}>
              Toque para abrir no Google Maps
            </div>
          </div>
        </div>
      )}

      {/* Status visual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const isAtivo = status === entrega.status;
          const isPast = Object.keys(STATUS_CONFIG).indexOf(status) < Object.keys(STATUS_CONFIG).indexOf(entrega.status);

          return (
            <div
              key={status}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                background: isAtivo ? cfg.cor : isPast ? '#27ae60' : '#3a3a3a',
                opacity: isAtivo || isPast ? 1 : 0.5
              }}
            >
              <div style={{ fontSize: '1.25rem' }}>{cfg.emoji}</div>
              <div style={{ fontSize: '0.625rem', marginTop: '0.25rem' }}>
                {status === 'A_CAMINHO' ? 'A Caminho' : cfg.label.split(' ')[0]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
