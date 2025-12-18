'use client';

import { useState } from 'react';
import Link from 'next/link';

import { AdminNav } from '@/components/AdminNav';

const ROLES = ['ADMIN', 'GERENTE', 'COZINHEIRO', 'MOTOBOY', 'CORRETOR'] as const;

export default function NovoUsuarioPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<(typeof ROLES)[number]>('GERENTE');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [projetoValorize, setProjetoValorize] = useState(false);

  const salvar = async () => {
    setMensagem('');
    setErro('');
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, role, senha: senha || undefined, projetoValorize })
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setMensagem(data.tempPassword ? `Usuário criado. Senha: ${data.tempPassword}` : 'Usuário criado.');
    } else {
      setErro(data.error || 'Erro ao criar usuário');
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      <AdminNav />
      <h1>Novo usuário</h1>
      <p>Crie usuários da equipe com role e senha inicial.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Nome
          <input value={nome} onChange={e => setNome(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Email
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Role
          <select value={role} onChange={e => setRole(e.target.value as any)} style={{ width: '100%', padding: 8 }}>
            {ROLES.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={projetoValorize}
            onChange={e => setProjetoValorize(e.target.checked)}
          />
          <span>Projeto Valorize (libera pacote de renovação)</span>
        </label>
        <label>
          Senha inicial (opcional)
          <input value={senha} onChange={e => setSenha(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </label>
        <button onClick={salvar} style={{ padding: 12, background: '#b22222', color: '#fff', border: 'none' }}>
          Criar usuário
        </button>
        {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
        <Link href="/admin/usuarios" style={{ color: '#b22222' }}>
          Voltar
        </Link>
      </div>
    </main>
  );
}
