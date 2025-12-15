#!/usr/bin/env bash
set -euo pipefail

# Executa migrations e seed usando a conexão direta (DIRECT_URL) quando disponível.

npx prisma migrate deploy
npx prisma db seed
