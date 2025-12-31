'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const ROLES = ['ADMIN', 'GERENTE', 'COZINHEIRO', 'MOTOBOY'] as const;
type Role = (typeof ROLES)[number];

type Usuario = {
  id: string;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  createdAt: string;
};

type ApiUserResponse = Usuario & { tempPassword?: string };

export default function UsuariosAdminPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [ativoFilter, setAtivoFilter] = useState<'ALL' | 'ATIVOS' | 'INATIVOS'>('ALL');
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novoRole, setNovoRole] = useState<Role>('GERENTE');
  const [novaSenha, setNovaSenha] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editRole, setEditRole] = useState<Role>('GERENTE');

  const carregarUsuarios = async () => {
    setLoading(true);
    setErro('');
    try {
      const res = await fetch('/api/admin/usuarios', { cache: 'no-store' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Erro ao carregar usuários');
      }
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setErro((err as Error).message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchBusca =
        usuario.nome.toLowerCase().includes(search.toLowerCase()) ||
        usuario.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'ALL' ? true : usuario.role === roleFilter;
      const matchAtivo =
        ativoFilter === 'ALL'
          ? true
          : ativoFilter === 'ATIVOS'
          ? usuario.ativo
          : !usuario.ativo;

      return matchBusca && matchRole && matchAtivo;
    });
  }, [usuarios, search, roleFilter, ativoFilter]);

  const handleCriarUsuario = async () => {
    setSubmitting(true);
    setErro('');
    setMensagem('');
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoNome,
          email: novoEmail,
          role: novoRole,
          senha: novaSenha || undefined
        })
      });

      const data: ApiUserResponse = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error((data as any)?.error || 'Erro ao criar usuário');
      }

      setUsuarios(prev => [data, ...prev]);
      setMensagem(data.tempPassword ? `Usuário criado. Senha temporária: ${data.tempPassword}` : 'Usuário criado.');
      setModalAberto(false);
      setNovoNome('');
      setNovoEmail('');
      setNovaSenha('');
      setNovoRole('GERENTE');
    } catch (err) {
      console.error(err);
      setErro((err as Error).message || 'Erro ao criar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSenha = async (usuario: Usuario) => {
    setSubmitting(true);
    setErro('');
    setMensagem('');
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}/reset-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data: ApiUserResponse = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error((data as any)?.error || 'Erro ao resetar senha');
      }

      setMensagem(
        data.tempPassword
          ? `Senha temporária do usuário ${usuario.email}: ${data.tempPassword}`
          : 'Senha redefinida com sucesso.'
      );
    } catch (err) {
      console.error(err);
      setErro((err as Error).message || 'Erro ao resetar senha');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAtivo = async (usuario: Usuario) => {
    setErro('');
    setMensagem('');
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !usuario.ativo })
      });
      const data: ApiUserResponse = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error((data as any)?.error || 'Erro ao atualizar usuário');
      }

      setUsuarios(prev => prev.map(u => (u.id === usuario.id ? data : u)));
      setMensagem(`Usuário ${usuario.email} agora está ${data.ativo ? 'ativado' : 'desativado'}.`);
    } catch (err) {
      console.error(err);
      setErro((err as Error).message || 'Erro ao atualizar usuário');
    }
  };

  const iniciarEdicao = (usuario: Usuario) => {
    setEditingId(usuario.id);
    setEditNome(usuario.nome);
    setEditRole(usuario.role);
  };

  const cancelarEdicao = () => {
    setEditingId(null);
    setEditNome('');
    setEditRole('GERENTE');
  };

  const salvarEdicao = async (usuario: Usuario) => {
    setSubmitting(true);
    setErro('');
    setMensagem('');
    try {
      const res = await fetch(`/api/admin/usuarios/${usuario.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editNome, role: editRole })
      });
      const data: ApiUserResponse = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        throw new Error((data as any)?.error || 'Erro ao atualizar usuário');
      }

      setUsuarios(prev => prev.map(u => (u.id === usuario.id ? data : u)));
      setMensagem('Dados atualizados com sucesso.');
      cancelarEdicao();
    } catch (err) {
      console.error(err);
      setErro((err as Error).message || 'Erro ao atualizar usuário');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Usuários</h1>
          <p style={{ margin: '4px 0', color: '#555' }}>
            Gerencie acessos da equipe (ADMIN, GERENTE, COZINHEIRO, MOTOBOY)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setModalAberto(true)}
            style={{
              background: '#b22222',
              color: '#fff',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Novo usuário
          </button>
          <Link href="/admin" style={{ alignSelf: 'center', color: '#b22222', textDecoration: 'underline' }}>
            Voltar ao painel
          </Link>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <input
          placeholder="Buscar por nome ou email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as any)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="ALL">Todos os papéis</option>
          {ROLES.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <select
          value={ativoFilter}
          onChange={e => setAtivoFilter(e.target.value as any)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
        >
          <option value="ALL">Todos</option>
          <option value="ATIVOS">Ativos</option>
          <option value="INATIVOS">Inativos</option>
        </select>
        <button
          onClick={carregarUsuarios}
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          Recarregar
        </button>
      </section>

      {erro && (
        <div style={{ background: '#ffe6e6', color: '#b22222', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          {erro}
        </div>
      )}

      {mensagem && (
        <div style={{ background: '#e6ffed', color: '#1b7b36', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          {mensagem}
        </div>
      )}

      <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#fafafa' }}>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Nome</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Email</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Role</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Ativo</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Criado</th>
              <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '16px', textAlign: 'center' }}>
                  Carregando...
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '16px', textAlign: 'center' }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} style={{ borderBottom: '1px solid #f3f3f3' }}>
                  <td style={{ padding: '12px' }}>
                    {editingId === usuario.id ? (
                      <input
                        value={editNome}
                        onChange={e => setEditNome(e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                    ) : (
                      usuario.nome
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>{usuario.email}</td>
                  <td style={{ padding: '12px' }}>
                    {editingId === usuario.id ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value as Role)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ddd' }}
                      >
                        {ROLES.map(role => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      usuario.role
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={usuario.ativo}
                        onChange={() => handleToggleAtivo(usuario)}
                      />
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </label>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {editingId === usuario.id ? (
                      <>
                        <button
                          onClick={() => salvarEdicao(usuario)}
                          disabled={submitting}
                          style={{
                            background: '#0d6efd',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Salvar
                        </button>
                        <button
                          onClick={cancelarEdicao}
                          style={{
                            background: '#fff',
                            color: '#333',
                            border: '1px solid #ddd',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => iniciarEdicao(usuario)}
                        style={{
                          background: '#fff',
                          color: '#333',
                          border: '1px solid #ddd',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleResetSenha(usuario)}
                      disabled={submitting}
                      style={{
                        background: '#fff',
                        color: '#333',
                        border: '1px solid #ddd',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Resetar senha
                    </button>
                    {!usuario.ativo && (
                      <button
                        onClick={() => handleToggleAtivo(usuario)}
                        style={{
                          background: '#b22222',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Ativar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <h2 style={{ margin: 0 }}>Novo usuário</h2>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span>Nome</span>
              <input
                value={novoNome}
                onChange={e => setNovoNome(e.target.value)}
                placeholder="Nome completo"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span>Email</span>
              <input
                value={novoEmail}
                onChange={e => setNovoEmail(e.target.value)}
                placeholder="email@empresa.com"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span>Role</span>
              <select
                value={novoRole}
                onChange={e => setNovoRole(e.target.value as Role)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span>Senha inicial (opcional)</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '0 8px'
                }}
              >
                <input
                  type={mostrarNovaSenha ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Deixe vazio para gerar senha temporária"
                  style={{ flex: 1, padding: '10px 8px', border: 'none', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarNovaSenha(prev => !prev)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b22222',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                  aria-label={mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarNovaSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <small style={{ color: '#777' }}>
                Mínimo 8 caracteres, pelo menos uma letra maiúscula e um símbolo.
              </small>
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setModalAberto(false)}
                style={{
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #ddd',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCriarUsuario}
                disabled={submitting}
                style={{
                  background: '#b22222',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: submitting ? 0.8 : 1
                }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
