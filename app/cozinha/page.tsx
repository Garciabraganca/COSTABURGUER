'use client';

import { useState, useEffect, useCallback } from 'react';

interface Ingrediente {
  id: string;
  slug: string;
  nome: string;
}

interface BurgerIngrediente {
  id: string;
  quantidade: number;
  ingrediente: Ingrediente;
}

interface Burger {
  id: string;
  nome: string;
  preco: number;
  ingredientes: BurgerIngrediente[];
}

interface Acompanhamento {
  id: string;
  quantidade: number;
  acompanhamento: {
    id: string;
    slug: string;
    nome: string;
  };
}

interface Entrega {
  id: string;
  token: string;
  status: string;
  motoboyNome?: string;
  latitudeAtual?: number;
  longitudeAtual?: number;
}

interface Pedido {
  id: string;
  numero: number;
  status: string;
  nome: string;
  celular: string;
  endereco: string;
  tipoEntrega: string;
  total: number;
  observacoes?: string;
  createdAt: string;
  burgers: Burger[];
  acompanhamentos: Acompanhamento[];
  entrega?: Entrega;
}

interface Stats {
  confirmados: number;
  preparando: number;
  prontos: number;
  emEntrega: number;
  total: number;
}

const STATUS_CONFIG: Record<string, { label: string; cor: string; proximo?: string }> = {
  CONFIRMADO: { label: 'Confirmado', cor: '#e74c3c', proximo: 'PREPARANDO' },
  PREPARANDO: { label: 'Preparando', cor: '#f39c12', proximo: 'PRONTO' },
  PRONTO: { label: 'Pronto', cor: '#27ae60', proximo: 'EM_ENTREGA' },
  EM_ENTREGA: { label: 'Em Entrega', cor: '#3498db' },
  ENTREGUE: { label: 'Entregue', cor: '#2ecc71' },
  CANCELADO: { label: 'Cancelado', cor: '#95a5a6' }
};

export default function CozinhaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [stats, setStats] = useState<Stats>({ confirmados: 0, preparando: 0, prontos: 0, emEntrega: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [conectado, setConectado] = useState(false);
  const [motoboyNome, setMotoboyNome] = useState('');
  const [despachando, setDespachando] = useState<string | null>(null);

  const carregarPedidos = useCallback(async () => {
    try {
      const res = await fetch('/api/cozinha?hoje=true');
      const data = await res.json();
      setPedidos(data.pedidos || []);
      setStats(data.stats || { confirmados: 0, preparando: 0, prontos: 0, emEntrega: 0, total: 0 });
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Conectar ao stream SSE
  useEffect(() => {
    carregarPedidos();

    const eventSource = new EventSource('/api/cozinha/stream');

    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      setPedidos(data.pedidos || []);
      setStats(data.stats || stats);
      setConectado(true);
      setLoading(false);
    });

    eventSource.addEventListener('novos_pedidos', (e) => {
      const data = JSON.parse(e.data);
      setPedidos(prev => [...data.pedidos, ...prev]);
      // Tocar som de notificação
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    });

    eventSource.addEventListener('pedidos_atualizados', (e) => {
      const data = JSON.parse(e.data);
      setPedidos(prev => {
        const novos = [...prev];
        for (const pedidoAtualizado of data.pedidos) {
          const idx = novos.findIndex(p => p.id === pedidoAtualizado.id);
          if (idx !== -1) {
            novos[idx] = pedidoAtualizado;
          }
        }
        return novos;
      });
    });

    eventSource.addEventListener('pedidos_removidos', (e) => {
      const data = JSON.parse(e.data);
      setPedidos(prev => prev.filter(p => !data.ids.includes(p.id)));
    });

    eventSource.addEventListener('stats', (e) => {
      const data = JSON.parse(e.data);
      setStats(data);
    });

    eventSource.onerror = () => {
      setConectado(false);
      // Tentar reconectar após 5 segundos
      setTimeout(() => {
        carregarPedidos();
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [carregarPedidos, stats]);

  const atualizarStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      const res = await fetch(`/api/cozinha/${pedidoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
      });

      if (res.ok) {
        const data = await res.json();
        setPedidos(prev => prev.map(p => p.id === pedidoId ? data.pedido : p));
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const despacharPedido = async (pedidoId: string) => {
    setDespachando(pedidoId);
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}/despachar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motoboyNome: motoboyNome || undefined })
      });

      if (res.ok) {
        const data = await res.json();
        setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: 'EM_ENTREGA', entrega: data.entrega } : p));
        setMotoboyNome('');
        // Copiar link do motoboy
        const motoboyUrl = `${window.location.origin}${data.motoboyUrl}`;
        navigator.clipboard.writeText(motoboyUrl).then(() => {
          alert(`Pedido despachado! Link do motoboy copiado:\n${motoboyUrl}`);
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao despachar pedido');
      }
    } catch (error) {
      console.error('Erro ao despachar:', error);
    } finally {
      setDespachando(null);
    }
  };

  const formatarHora = (data: string) => {
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const calcularTempoEspera = (createdAt: string) => {
    const minutos = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    if (minutos < 60) return `${minutos}min`;
    return `${Math.floor(minutos / 60)}h${minutos % 60}min`;
  };

  const sair = () => {
    document.cookie = 'token=; Path=/; Max-Age=0';
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff', padding: '1rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f9c46b' }}>Painel da Cozinha</h1>
          <p style={{ fontSize: '0.875rem', color: conectado ? '#27ae60' : '#e74c3c' }}>
            {conectado ? '● Conectado' : '○ Reconectando...'}
          </p>
        </div>

        {/* Estatísticas */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#e74c3c', padding: '0.5rem 1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.confirmados}</div>
              <div style={{ fontSize: '0.75rem' }}>Confirmados</div>
            </div>
            <div style={{ background: '#f39c12', padding: '0.5rem 1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.preparando}</div>
              <div style={{ fontSize: '0.75rem' }}>Preparando</div>
            </div>
            <div style={{ background: '#27ae60', padding: '0.5rem 1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.prontos}</div>
              <div style={{ fontSize: '0.75rem' }}>Prontos</div>
            </div>
            <div style={{ background: '#3498db', padding: '0.5rem 1rem', borderRadius: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.emEntrega}</div>
              <div style={{ fontSize: '0.75rem' }}>Em Entrega</div>
            </div>
          </div>

          <button
            onClick={sair}
            style={{
              padding: '0.75rem 1rem',
              background: '#444',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Lista de Pedidos */}
      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <p style={{ fontSize: '1.25rem' }}>Nenhum pedido ativo</p>
          <p style={{ fontSize: '0.875rem' }}>Novos pedidos aparecerão aqui automaticamente</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {pedidos.map(pedido => {
            const config = STATUS_CONFIG[pedido.status] || { label: pedido.status, cor: '#888' };
            const isDespachar = pedido.status === 'PRONTO' && pedido.tipoEntrega === 'ENTREGA' && !pedido.entrega;

            return (
              <div
                key={pedido.id}
                style={{
                  background: '#2a2a2a',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  border: `2px solid ${config.cor}`
                }}
              >
                {/* Cabeçalho do pedido */}
                <div style={{ background: config.cor, padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>#{pedido.numero}</span>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>{config.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem' }}>{formatarHora(pedido.createdAt)}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{calcularTempoEspera(pedido.createdAt)}</div>
                  </div>
                </div>

                {/* Conteúdo */}
                <div style={{ padding: '1rem' }}>
                  {/* Cliente */}
                  <div style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #444' }}>
                    <div style={{ fontWeight: 'bold' }}>{pedido.nome}</div>
                    <div style={{ fontSize: '0.875rem', color: '#aaa' }}>{pedido.celular}</div>
                    <div style={{ fontSize: '0.875rem', color: pedido.tipoEntrega === 'RETIRADA' ? '#f39c12' : '#3498db' }}>
                      {pedido.tipoEntrega === 'RETIRADA' ? 'Retirada no balcão' : pedido.endereco}
                    </div>
                  </div>

                  {/* Itens */}
                  <div style={{ marginBottom: '0.75rem' }}>
                    {pedido.burgers.map((burger, idx) => (
                      <div key={burger.id} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ fontWeight: 'bold', color: '#f9c46b' }}>
                          {idx + 1}. {burger.nome}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#aaa', paddingLeft: '1rem' }}>
                          {burger.ingredientes.map(ing => ing.ingrediente.nome).join(', ')}
                        </div>
                      </div>
                    ))}

                    {pedido.acompanhamentos.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
                        + {pedido.acompanhamentos.map(ac => `${ac.quantidade}x ${ac.acompanhamento.nome}`).join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  {pedido.observacoes && (
                    <div style={{ background: '#3a3a3a', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                      <strong>Obs:</strong> {pedido.observacoes}
                    </div>
                  )}

                  {/* Entrega info */}
                  {pedido.entrega && (
                    <div style={{ background: '#1a3a5a', padding: '0.5rem', borderRadius: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                      <div>Motoboy: {pedido.entrega.motoboyNome || 'Não informado'}</div>
                      <div>Status: {pedido.entrega.status}</div>
                    </div>
                  )}

                  {/* Ações */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {config.proximo && !isDespachar && (
                      <button
                        onClick={() => atualizarStatus(pedido.id, config.proximo!)}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: STATUS_CONFIG[config.proximo]?.cor || '#444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {STATUS_CONFIG[config.proximo]?.label}
                      </button>
                    )}

                    {isDespachar && (
                      <div style={{ width: '100%' }}>
                        <input
                          type="text"
                          placeholder="Nome do motoboy (opcional)"
                          value={motoboyNome}
                          onChange={e => setMotoboyNome(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            marginBottom: '0.5rem',
                            borderRadius: '0.25rem',
                            border: '1px solid #444',
                            background: '#3a3a3a',
                            color: '#fff'
                          }}
                        />
                        <button
                          onClick={() => despacharPedido(pedido.id)}
                          disabled={despachando === pedido.id}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#3498db',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            opacity: despachando === pedido.id ? 0.7 : 1
                          }}
                        >
                          {despachando === pedido.id ? 'Despachando...' : 'Despachar Entrega'}
                        </button>
                      </div>
                    )}

                    {pedido.status === 'PRONTO' && pedido.tipoEntrega === 'RETIRADA' && (
                      <button
                        onClick={() => atualizarStatus(pedido.id, 'ENTREGUE')}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: '#2ecc71',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '0.5rem',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Marcar Retirado
                      </button>
                    )}

                    {pedido.status !== 'CANCELADO' && pedido.status !== 'ENTREGUE' && (
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza que deseja cancelar este pedido?')) {
                            atualizarStatus(pedido.id, 'CANCELADO');
                          }
                        }}
                        style={{
                          padding: '0.75rem',
                          background: 'transparent',
                          color: '#e74c3c',
                          border: '1px solid #e74c3c',
                          borderRadius: '0.5rem',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
