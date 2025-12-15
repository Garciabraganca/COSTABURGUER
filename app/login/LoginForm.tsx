'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { roleRedirect } from './roleRedirect';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        setErro(data?.message ?? 'Credenciais inválidas');
        return;
      }

      const destino = roleRedirect[data.role] || '/cozinha';
      router.replace(destino);
    } catch (error) {
      console.error('Erro ao autenticar:', error);
      setErro('Erro ao autenticar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-semibold text-white">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="nome@empresa.com"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-semibold text-white">Senha</label>
        <div className="flex items-center rounded-lg border border-white/20 bg-white/10 px-3 text-white focus-within:ring-2 focus-within:ring-pink-400">
          <input
            type={mostrarSenha ? 'text' : 'password'}
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            className="flex-1 bg-transparent px-1 py-3 text-white placeholder:text-white/50 focus:outline-none"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha(prev => !prev)}
            className="text-xs font-semibold text-pink-200 hover:text-white"
            aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrarSenha ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>

      {erro && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-50 shadow-lg shadow-red-900/20">
          {erro}
        </div>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full rounded-lg bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-4 py-3 font-bold text-white shadow-neon-pink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-80"
      >
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
