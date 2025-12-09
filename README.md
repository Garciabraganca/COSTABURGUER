# Costa-Burger MVP (Front-end estático)

Este projeto é um MVP estático do app da hamburgueria **Costa-Burger**, no estilo artesanal (fundo kraft, vermelho escuro e linhas minimalistas).
Foi pensado para ser facilmente estendido por um dev (ou por uma IA tipo Codex/Copilot) para virar um app completo com backend, banco e integrações.

## Como rodar

1. Suba o conteúdo desta pasta em qualquer servidor estático (Netlify, Vercel estático, Nginx, Apache) **ou** abra `index.html` diretamente no navegador.
2. O app funciona como **Single Page Application** simples em JavaScript puro:
   - Tela Home
   - Montagem de burger em camadas
   - Sacola
   - Endereço de entrega
   - Pagamento (simulado)
   - Tela de rastreamento (status simulado)

## Estrutura de pastas

- `index.html` – página principal com todas as telas e navegação básica.
- `css/styles.css` – estilos globais no tema kraft/vermelho.
- `js/app.js` – lógica de front-end (estado, telas, carrinho, simulações).
- `img/logo-kraft.svg` – logo ilustrativa no estilo artesanal.

## Próximos passos sugeridos

- Converter este front-end em um projeto React/Next.js.
- Criar uma API em Node/NestJS com:
  - CRUD de pedidos
  - Status em tempo real (WebSocket)
  - Integração Mercado Pago (webhooks)
  - Integração com WhatsApp (notificações / remarketing)
- Criar painel admin (cozinha, entregador, dashboard) a partir da base visual já descrita.

Veja o arquivo `codex-command.txt` para um prompt de evolução automática do projeto.
