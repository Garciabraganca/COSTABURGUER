'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Entrega = {
  id: string;
  status: string;
  motoboyNome?: string;
  latitudeAtual?: number;
  longitudeAtual?: number;
  ultimaAtualizacao?: string;
  pedido: {
    nome: string;
    endereco: string;
    tipoEntrega: string;
    status: string;
  };
  localizacoes: Array<{ latitude: number; longitude: number; createdAt: string }>;
};

export default function EntregaPublicaPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const ultima = useMemo(() => entrega?.localizacoes?.[0], [entrega]);

  const carregarEntrega = useCallback(async () => {
    try {
      const res = await fetch(`/api/entregas/${token}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.message || 'Erro ao carregar entrega');
      setEntrega(data.entrega);
    } catch (error) {
      setErro((error as Error).message);
    }
  }, [token]);

  const enviarLocalizacao = useCallback(async (coords: GeolocationCoordinates) => {
    setEnviando(true);
    setErro('');
    try {
      const res = await fetch(`/api/entregas/${token}/localizacao`, {
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
      carregarEntrega();
    } catch (err) {
      setErro((err as Error).message);
    } finally {
      setEnviando(false);
    }
  }, [carregarEntrega, token]);

  useEffect(() => {
    carregarEntrega();
  }, [carregarEntrega]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setErro('Geolocalização não suportada');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      pos => {
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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-8 text-white">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rastreamento</p>
        <h1 className="text-3xl font-black">Entrega #{token.slice(-6)}</h1>
        {erro && <p className="text-sm text-red-300">{erro}</p>}
        {mensagem && <p className="text-sm text-emerald-300">{mensagem}</p>}
      </header>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Status do pedido</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-white">{entrega?.pedido.status || 'Carregando'}</span>
        </div>
        <div className="mt-3 text-sm text-white/80">
          <p>Cliente: {entrega?.pedido.nome || '---'}</p>
          <p>Endereço: {entrega?.pedido.endereco || '---'}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
        <p className="font-semibold text-white">Última localização</p>
        {ultima ? (
          <div className="mt-2 space-y-1">
            <p>Lat: {ultima.latitude.toFixed(5)} | Lng: {ultima.longitude.toFixed(5)}</p>
            <p>Atualizado em: {new Date(ultima.createdAt).toLocaleTimeString('pt-BR')}</p>
            <a
              href={`https://www.google.com/maps?q=${ultima.latitude},${ultima.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-pink-200 hover:text-white"
            >
              Abrir no Google Maps
            </a>
          </div>
        ) : (
          <p className="text-white/60">Nenhum ponto recebido ainda.</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-white/80">
        <p className="font-semibold text-white">Motoboy</p>
        <p>{entrega?.motoboyNome || 'Não informado'}</p>
        <p>Status da entrega: {entrega?.status || '---'}</p>
        {enviando && <p className="text-xs text-white/70">Enviando localização...</p>}
        <p className="mt-2 text-xs text-white/60">Mantenha esta página aberta para atualizar automaticamente.</p>
      </div>
    </main>
  );
}
