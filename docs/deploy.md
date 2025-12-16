# Deploy e liberação do banco

## Build na Vercel
- O comando de build é apenas `next build`. Nenhum comando de migração roda durante o build.

## Migrations e seed
- As migrações e o seed são aplicados automaticamente pelo workflow `Database Release` em pushes para a branch `main` ou via execução manual (`workflow_dispatch`).
- Configure os secrets no repositório:
  - `DATABASE_URL`: string de conexão do pooler/runtime.
  - `DIRECT_URL`: string de conexão direta para migrations.
  - (opcional) `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`: variáveis de proxy, caso a rede corporativa exija.
  - (opcional) `PRISMA_ENGINES_MIRROR`: espelho para download dos engines Prisma.
- O workflow executa `npm run db:generate` seguido de `npm run db:release` (`db:migrate` + `db:seed`) em ambiente com rede liberada.

## Execução manual
- Para aplicar migrações e seed manualmente, use:

```bash
npm run db:release
```

Certifique-se de exportar `DATABASE_URL` e `DIRECT_URL` antes de rodar o comando. Caso esteja atrás de um proxy, também exporte `HTTP_PROXY`, `HTTPS_PROXY` e `NO_PROXY` conforme necessário.
