# Deploy e liberação do banco

## Build na Vercel
- O comando de build é apenas `next build`. Nenhum comando de migração roda durante o build.

## Migrations e seed
- As migrações e o seed são aplicados automaticamente pelo workflow `Database Release` em pushes para a branch `main`.
- Configure os secrets no repositório:
  - `DATABASE_URL`: string de conexão do pooler/runtime.
  - `DIRECT_URL`: string de conexão direta para migrations.
- O workflow executa `npm run db:generate` seguido de `npm run db:release` (`db:migrate` + `db:seed`).

## Execução manual
- Para aplicar migrações e seed manualmente, use:

```bash
npm run db:release
```

Certifique-se de exportar `DATABASE_URL` e `DIRECT_URL` antes de rodar o comando.
