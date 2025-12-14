'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const roleRedirect: Record<string, string> = {
  COZINHEIRO: '/cozinha',
  GERENTE: '/gerente',
  ADM: '/admin',
  MOTOBOY: '/cozinha'
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      if (!res.ok) {
        setErro('Credenciais inválidas');
        return;
      }

      const data = await res.json();
      const destino = roleRedirect[data.role] || '/cozinha';
      router.push(destino);
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      setErro('Erro ao autenticar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

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
          maxWidth: '420px',
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
          <h1 style={{ margin: 0 }}>Acesso da equipe</h1>
          <p style={{ margin: '8px 0 0', color: '#555' }}>
            Entre com seu email corporativo
          </p>
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Email</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
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
          disabled={carregando}
          style={{
            background: '#b22222',
            color: '#fff',
            border: 'none',
            padding: '14px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            opacity: carregando ? 0.8 : 1
          }}
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
