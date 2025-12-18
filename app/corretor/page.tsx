import { redirect } from 'next/navigation';

import { safeGetSessionFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const valorizeRenewal = {
  leads: 30,
  price: 1400,
  description: 'Pacote de renovação exclusivo para corretores do Projeto Valorize.'
};

export default async function CorretorValorizePage() {
  const session = await safeGetSessionFromCookies();

  if (!session || session.role !== 'CORRETOR') {
    redirect('/login');
  }

  if (!prisma) {
    return (
      <main style={{ padding: '32px', maxWidth: 800, margin: '0 auto' }}>
        <section
          style={{
            background: '#fff8f0',
            border: '1px solid #f5d0a9',
            borderRadius: 12,
            padding: 24,
            color: '#7a4a1a',
            boxShadow: '0 12px 30px rgba(0,0,0,0.06)'
          }}
        >
          <h1 style={{ margin: 0 }}>Projeto Valorize</h1>
          <p style={{ marginTop: 8 }}>
            Não foi possível acessar o banco de dados para validar seu perfil. Confirme o DATABASE_URL ou tente novamente.
          </p>
        </section>
      </main>
    );
  }

  const corretor = await prisma.usuario.findUnique({
    where: { id: session.id },
    select: { nome: true, projetoValorize: true }
  });

  if (!corretor) {
    redirect('/login');
  }

  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f1e8',
        padding: '32px',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          maxWidth: 960,
          width: '100%',
          boxShadow: '0 18px 42px rgba(0,0,0,0.08)',
          border: '1px solid #f0dfcf'
        }}
      >
        <header style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, color: '#b22222', fontWeight: 800, letterSpacing: 0.5 }}>Projeto Valorize</p>
          <h1 style={{ margin: '6px 0 8px', fontSize: 32, fontWeight: 900 }}>
            Olá, {corretor.nome}! Confira seu pacote dedicado.
          </h1>
          <p style={{ margin: 0, color: '#4a3625' }}>
            Mantivemos aberto o pacote de renovação de {valorizeRenewal.leads} leads por
            {` ${currency.format(valorizeRenewal.price)}.`} Apenas corretores com o selo Projeto Valorize conseguem acessá-lo.
          </p>
        </header>

        {corretor.projetoValorize ? (
          <section
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
            }}
          >
            <article
              style={{
                border: '1px solid #e7d4c4',
                borderRadius: 14,
                padding: 20,
                background: '#fffaf5',
                boxShadow: '0 10px 26px rgba(0,0,0,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#b22222',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontWeight: 800
                  }}
                >
                  Renovação
                </span>
                <span style={{ color: '#1b7b36', fontWeight: 700 }}>Acesso liberado</span>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>Pacote de {valorizeRenewal.leads} leads</h2>
              <p style={{ margin: '0 0 12px', color: '#4a3625' }}>{valorizeRenewal.description}</p>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#b22222' }}>
                {currency.format(valorizeRenewal.price)}
              </div>
              <ul style={{ margin: '12px 0 0', paddingLeft: 20, color: '#4a3625', lineHeight: 1.6 }}>
                <li>Disponível para renovação imediata.</li>
                <li>Manutenção dos benefícios atuais do Projeto Valorize.</li>
                <li>Solicite ao time caso precise de ajustes de prazos ou faturas.</li>
              </ul>
            </article>
          </section>
        ) : (
          <section
            style={{
              border: '1px dashed #d7b89a',
              background: '#fff9f3',
              borderRadius: 12,
              padding: 20,
              color: '#7a4a1a'
            }}
          >
            <h2 style={{ marginTop: 0 }}>Aguardando habilitação do Projeto Valorize</h2>
            <p style={{ marginBottom: 12 }}>
              Identificamos seu login, mas sua conta ainda não está marcada como parte do Projeto Valorize. Peça para um admin
              habilitar a flag para liberar o pacote de renovação de {valorizeRenewal.leads} leads por {currency.format(
                valorizeRenewal.price
              )}.
            </p>
            <p style={{ margin: 0 }}>Assim que a flag for ativada, este pacote aparecerá automaticamente aqui.</p>
          </section>
        )}
      </div>
    </main>
  );
}
