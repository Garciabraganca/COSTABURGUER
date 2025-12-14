'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Pedido {
  id: string;
  numero: number;
  nome: string;
  celular: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  total: number;
  observacoes?: string;
}

interface Entrega {
  id: string;
  status: string;
  pedido: Pedido;
  latitudeAtual?: number;
  longitudeAtual?: number;
  ultimaAtualizacao?: string;
}

const STATUS_CONFIG: Record<string, { label: string; cor: string; proximo?: string }> = {
  AGUARDANDO: { label: 'Aguardando', cor: '#f39c12', proximo: 'A_CAMINHO' },
  A_CAMINHO: { label: 'A Caminho', cor: '#3498db', proximo: 'CHEGANDO' },
  CHEGANDO: { label: 'Chegando', cor: '#9b59b6', proximo: 'ENTREGUE' },
  ENTREGUE: { label: 'Entregue', cor: '#27ae60' }
};

export default function MotoboyPage() {
  const params = useParams();
  const token = params.token as string;

  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [rastreando, setRastreando] = useState(false);
  const [ultimaLocalizacao, setUltimaLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [precisao, setPrecisao] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const carregarEntrega = useCallback(async () => {
    try {
      const res = await fetch(`/api/delivery/${token}`);
      if (!res.ok) {
        if (res.status === 404) {
          setErro('Entrega não encontrada. Verifique o link.');
        } else {
          setErro('Erro ao carregar entrega');
        }
        return;
      }
      const data = await res.json();
      setEntrega(data);
      setErro(null);
    } catch {
      setErro('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarEntrega();
  }, [carregarEntrega]);

  const enviarLocalizacao = useCallback(async (latitude: number, longitude: number, precisao?: number, velocidade?: number, direcao?: number) => {
    try {
      const res = await fetch(`/api/delivery/${token}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude, precisao, velocidade, direcao })
      });

      if (res.ok) {
        const data = await res.json();
        setEntrega(prev => prev ? { ...prev, ...data.entrega } : null);
        setUltimaLocalizacao({ lat: latitude, lng: longitude });
        setPrecisao(precisao || null);
      }
    } catch (error) {
      console.error('Erro ao enviar localização:', error);
    }
  }, [token]);

  const iniciarRastreamento = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada neste navegador');
      return;
    }

    setRastreando(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } = position.coords;
        enviarLocalizacao(
          latitude,
          longitude,
          accuracy,
          speed || undefined,
          heading || undefined
        );
      },
      (error) => {
        console.error('Erro de geolocalização:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Permissão de localização negada. Por favor, permita o acesso.');
            setRastreando(false);
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('Posição indisponível');
            break;
          case error.TIMEOUT:
            console.warn('Timeout ao obter localização');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }, [enviarLocalizacao]);

  const pararRastreamento = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setRastreando(false);
  }, []);

  const atualizarStatus = async (novoStatus: string) => {
    try {
      const res = await fetch(`/api/delivery/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setEntrega(prev => prev ? { ...prev, status: data.status } : null);

        if (novoStatus === 'ENTREGUE') {
          pararRastreamento();
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const abrirMapa = () => {
    if (!entrega?.pedido) return;

    const { endereco, latitude, longitude } = entrega.pedido;
    let url: string;

    if (latitude && longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
    }

    window.open(url, '_blank');
  };

  const ligarCliente = () => {
    if (entrega?.pedido.celular) {
      window.location.href = `tel:${entrega.pedido.celular}`;
    }
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Carregando entrega...</p>
      </div>
    );
  }

  if (erro || !entrega) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Erro</h1>
          <p>{erro || 'Entrega não encontrada'}</p>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[entrega.status] || { label: entrega.status, cor: '#888' };

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff' }}>
      {/* Header */}
      <header style={{ background: config.cor, padding: '1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Pedido #{entrega.pedido.numero}
        </h1>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
          {config.label}
        </div>
      </header>

      {/* Status do rastreamento */}
      <div style={{ padding: '1rem', background: rastreando ? '#1a3a1a' : '#3a3a3a', textAlign: 'center' }}>
        {rastreando ? (
          <>
            <div style={{ color: '#27ae60', marginBottom: '0.5rem' }}>
              ● Enviando localização
            </div>
            {ultimaLocalizacao && (
              <div style={{ fontSize: '0.75rem', color: '#888' }}>
                Lat: {ultimaLocalizacao.lat.toFixed(6)} | Lng: {ultimaLocalizacao.lng.toFixed(6)}
                {precisao && ` | Precisão: ${Math.round(precisao)}m`}
              </div>
            )}
          </>
        ) : (
          <div style={{ color: '#f39c12' }}>
            ○ Rastreamento pausado
          </div>
        )}
      </div>

      {/* Informações do pedido */}
      <div style={{ padding: '1rem' }}>
        <div style={{ background: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', color: '#f9c46b', marginBottom: '0.75rem' }}>Cliente</h2>

          <div style={{ marginBottom: '0.5rem' }}>
            <strong>{entrega.pedido.nome}</strong>
          </div>

          <div
            style={{ marginBottom: '0.5rem', cursor: 'pointer', color: '#3498db' }}
            onClick={ligarCliente}
          >
            📞 {entrega.pedido.celular}
          </div>

          <div
            style={{ cursor: 'pointer', color: '#e74c3c' }}
            onClick={abrirMapa}
          >
            📍 {entrega.pedido.endereco}
          </div>

          {entrega.pedido.observacoes && (
            <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#3a3a3a', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
              <strong>Obs:</strong> {entrega.pedido.observacoes}
            </div>
          )}
        </div>

        {/* Valor */}
        <div style={{ background: '#2a2a2a', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: '#888' }}>Valor a receber</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
            R$ {entrega.pedido.total.toFixed(2)}
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Botão de rastreamento */}
          {entrega.status !== 'ENTREGUE' && (
            <button
              onClick={rastreando ? pararRastreamento : iniciarRastreamento}
              style={{
                padding: '1rem',
                background: rastreando ? '#e74c3c' : '#27ae60',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {rastreando ? '⏸ Pausar Rastreamento' : '▶ Iniciar Rastreamento'}
            </button>
          )}

          {/* Botão de status */}
          {config.proximo && (
            <button
              onClick={() => atualizarStatus(config.proximo!)}
              style={{
                padding: '1rem',
                background: STATUS_CONFIG[config.proximo]?.cor || '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Marcar como: {STATUS_CONFIG[config.proximo]?.label}
            </button>
          )}

          {/* Abrir no mapa */}
          <button
            onClick={abrirMapa}
            style={{
              padding: '1rem',
              background: '#3498db',
              color: '#fff',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🗺 Abrir no Google Maps
          </button>

          {/* Ligar */}
          <button
            onClick={ligarCliente}
            style={{
              padding: '1rem',
              background: '#2a2a2a',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📞 Ligar para Cliente
          </button>
        </div>
      </div>

      {/* Mensagem de entrega finalizada */}
      {entrega.status === 'ENTREGUE' && (
        <div style={{ padding: '1rem', background: '#1a3a1a', textAlign: 'center', marginTop: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#27ae60' }}>
            Entrega Finalizada!
          </div>
          <div style={{ color: '#888', marginTop: '0.5rem' }}>
            Obrigado pelo trabalho!
          </div>
        </div>
      )}
    </div>
  );
}
