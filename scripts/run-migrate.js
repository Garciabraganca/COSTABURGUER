const { execSync } = require('child_process');

const directUrl = process.env.DIRECT_URL;
const pooledUrl = process.env.DATABASE_URL;
const connectionString = directUrl || pooledUrl;
const strict = process.env.MIGRATE_STRICT === '1';

if (!connectionString) {
  const message = '[migrate] variáveis DIRECT_URL/DATABASE_URL ausentes; não é possível aplicar migrations.';
  if (strict) {
    console.error(`${message} Defina DIRECT_URL (porta 5432 do Supabase) para builds de produção.`);
    process.exit(1);
  }
  console.warn(`${message} Prosseguindo sem rodar prisma migrate deploy.`);
  process.exit(0);
}

try {
  console.log('[migrate] executando prisma migrate deploy usando', directUrl ? 'DIRECT_URL' : 'DATABASE_URL');
  execSync('prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DIRECT_URL: connectionString },
  });
  console.log('[migrate] migrations aplicadas com sucesso.');
} catch (error) {
  const stderr = error?.stderr?.toString?.() || '';
  const stdout = error?.stdout?.toString?.() || '';
  const message = `${error?.message || ''}\n${stderr}\n${stdout}`;
  const connectivityIssue = /P1001|P1002|ECONNREFUSED|ENOTFOUND|timeout|Can't reach database server/i.test(message);

  if (connectivityIssue && !strict) {
    console.warn('[migrate] aviso: não foi possível conectar ao banco para aplicar migrations. Prosseguindo sem falhar o build.');
    console.warn('[migrate] detalhe:', message.trim());
    console.warn('[migrate] defina MIGRATE_STRICT=1 para falhar o build quando a conexão não estiver disponível.');
    process.exit(0);
  }

  console.error('[migrate] falha ao aplicar migrations.');
  console.error(message.trim());
  process.exit(error?.status || 1);
}
