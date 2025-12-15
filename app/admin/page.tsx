import { cookies } from 'next/headers';
import Link from 'next/link';

import { AdminNav } from '@/components/AdminNav';
import { verificarJwt } from '@/lib/jwt';

export default async function AdminPage() {
  const token = cookies().get('token')?.value;
  const payload = token ? await verificarJwt(token) : null;
  const roleLabel = payload ? (payload as any).role : 'Desconhecido';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f8f8',
        padding: '32px'
      }}
    >
      <div
        style={{
          maxWidth: '720px',
          width: '100%',
          background: '#fff',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.08)'
        }}
      >
        <AdminNav />
        <h1 style={{ marginTop: 0 }}>Painel de Administração</h1>
        <p style={{ color: '#555', marginBottom: '24px' }}>Sessão como: <strong>{roleLabel}</strong></p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Link
            href="/admin/usuarios"
            style={{
              display: 'block',
              padding: '18px',
              background: '#b22222',
              color: '#fff',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700
            }}
          >
            Usuários
            <span style={{ display: 'block', fontWeight: 400 }}>Criar, editar e desativar contas</span>
          </Link>

          <Link
            href="/login"
            style={{
              display: 'block',
              padding: '18px',
              background: '#f2f2f2',
              color: '#333',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 700
            }}
          >
            Trocar usuário
            <span style={{ display: 'block', fontWeight: 400 }}>Voltar para tela de login</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
