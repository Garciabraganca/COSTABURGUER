'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminBootstrapPage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [chave, setChave] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/admin/bootstrap/status', { cache: 'no-store' });
        const data = await res.json();

        if (!data?.needsBootstrap) {
          router.replace('/login');
          return;
        }
      } catch (err) {
        console.error('Erro ao verificar bootstrap', err);
        setErro('Não foi possível verificar o estado do bootstrap.');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-bootstrap-key': chave
        },
        body: JSON.stringify({ nome, email, senha })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data?.error || 'Não foi possível criar o admin inicial.');
        return;
      }

      router.push('/admin/usuarios');
    } catch (err) {
      console.error('Erro ao criar admin inicial', err);
      setErro('Erro ao criar o Admin. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Verificando estado do bootstrap...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
        padding: '24px'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#fff',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0 }}>Ativação do Admin</h1>
          <p style={{ margin: '8px 0 0', color: '#555' }}>
            Use a chave enviada pelo time para criar o primeiro administrador.
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Nome</span>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            minLength={8}
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <small style={{ color: '#777' }}>
            Use pelo menos 8 caracteres, incluindo uma letra maiúscula e um símbolo.
          </small>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Chave de ativação (ADMIN_BOOTSTRAP_KEY)</span>
          <input
            type="text"
            value={chave}
            onChange={e => setChave(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
        </label>

        {erro && (
          <div
            style={{
              background: '#ffe6e6',
              color: '#b22222',
              padding: '12px',
              borderRadius: '8px'
            }}
          >
            {erro}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            background: '#b22222',
            color: '#fff',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: submitting ? 0.8 : 1
          }}
        >
          {submitting ? 'Criando...' : 'Criar Admin'}
        </button>
      </form>
    </main>
  );
}
