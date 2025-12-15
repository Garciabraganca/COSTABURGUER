import { ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { LoginForm } from './LoginForm';
import { roleRedirect } from './roleRedirect';
import { safeGetSessionFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const session = await safeGetSessionFromCookies();
  const destino = session ? roleRedirect[session.role] ?? '/cozinha' : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black px-6 py-12 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,78,205,0.2),transparent_30%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(0,234,255,0.15),transparent_30%)]" />

      <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3 text-pink-200">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">Costa Burger Crew</span>
          </div>
          <h1 className="mt-3 text-3xl font-black leading-tight">
            Acesso da equipe
          </h1>
          <p className="mt-2 text-white/80">Entre com seu email corporativo para continuar.</p>

          <div className="mt-8 space-y-6">
            {session ? (
              <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-50 shadow-neon-glow">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-5 w-5" /> Sessão ativa
                </div>
                <p className="mt-2 text-white/80">
                  Você já está autenticado como <strong>{session.role}</strong>.
                </p>
                {destino && (
                  <Link
                    href={destino}
                    className="mt-3 inline-flex items-center gap-2 text-pink-200 underline decoration-pink-200/60 underline-offset-4 hover:text-white"
                  >
                    Ir para o painel
                  </Link>
                )}
              </div>
            ) : null}

            <LoginForm />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-cyan-500/10 p-8 shadow-2xl backdrop-blur">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(255,255,255,0.08),transparent_45%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">Segurança reforçada</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">Login resiliente</h2>
              <p className="mt-3 text-white/80">
                Autenticação com proteção contra falhas de sessão. Se algo parecer errado, recarregue a página ou tente novamente.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-lg font-bold text-white">Sem quedas</div>
                <p className="mt-1 text-white/70">Validação de sessão sem exceções server-side.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-lg font-bold text-white">Redirecionamento seguro</div>
                <p className="mt-1 text-white/70">Após login, seguimos direto para o seu painel.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
