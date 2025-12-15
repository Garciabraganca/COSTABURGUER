'use client';

import { useCallback, useEffect, useState } from 'react';

export default function EntregaPublicaPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [status, setStatus] = useState('AGUARDANDO');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const enviarLocalizacao = useCallback(async (coords: GeolocationCoordinates) => {
    setEnviando(true);
    setErro('');
    try {
      const res = await fetch(`/api/entrega/${token}/localizacao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          precisao: coords.accuracy,
          velocidade: coords.speed ?? undefined,
          direcao: coords.heading ?? undefined
        })
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar localização');
      }

      setMensagem('Localização enviada');
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }, [token]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setErro('Geolocalização não suportada');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        setStatus('A_CAMINHO');
        enviarLocalizacao(pos.coords);
      },
      err => {
        setErro(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enviarLocalizacao, token]);

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1>Rastreio da entrega</h1>
      <p>Token: {token}</p>
      <p>Status atual: {status}</p>
      {mensagem && <div style={{ color: 'green', marginTop: 8 }}>{mensagem}</div>}
      {erro && <div style={{ color: 'red', marginTop: 8 }}>{erro}</div>}
      {enviando && <p>Enviando localização...</p>}
      <p style={{ marginTop: 16 }}>Mantenha esta página aberta para atualizar sua posição.</p>
    </main>
  );
}
