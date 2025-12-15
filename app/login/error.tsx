'use client';

import { useEffect } from 'react';
import { RefreshCcw, Undo2 } from 'lucide-react';

export default function LoginError({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Erro na página de login.');
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <h1 className="text-3xl font-black">Ops, algo deu errado</h1>
        <p className="mt-3 text-white/70">
          Não conseguimos carregar o login agora. Você pode tentar novamente ou voltar.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            <RefreshCcw className="h-4 w-4" /> Tentar de novo
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            <Undo2 className="h-4 w-4" /> Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
