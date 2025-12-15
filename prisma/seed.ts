import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

// Categorias de ingredientes
const categorias = [
  { slug: 'pao', nome: 'Pães', cor: '#f9c46b', ordem: 1 },
  { slug: 'carne', nome: 'Carnes', cor: '#5b3620', ordem: 2 },
  { slug: 'queijo', nome: 'Queijos', cor: '#f4d25a', ordem: 3 },
  { slug: 'molho', nome: 'Molhos', cor: '#c0392b', ordem: 4 },
  { slug: 'vegetal', nome: 'Vegetais', cor: '#27ae60', ordem: 5 },
  { slug: 'extra', nome: 'Extras', cor: '#e67e22', ordem: 6 },
  { slug: 'especial', nome: 'Especiais', cor: '#9b59b6', ordem: 7 },
];

// Ingredientes com custo estimado (aproximadamente 40% do preço de venda)
const ingredientes = [
  // === PÃES ===
  { slug: 'pao-australiano', nome: 'Pão Australiano', categoria: 'pao', preco: 3, custo: 1.2, ordem: 1, imagem: '/ingredients/paes/PÃO AUSTRALIANO.png' },
  { slug: 'pao-brioche', nome: 'Pão Brioche', categoria: 'pao', preco: 2.5, custo: 1, ordem: 2, imagem: '/ingredients/paes/PÃO BRIOCHE.png' },
  { slug: 'pao-beterraba', nome: 'Pão de Beterraba', categoria: 'pao', preco: 4, custo: 1.6, ordem: 3, imagem: '/ingredients/paes/PÃO  DE BETERRABA.png' },
  { slug: 'pao-gergelim-gold', nome: 'Pão Gergelim Gold', categoria: 'pao', preco: 3.5, custo: 1.4, ordem: 4, imagem: '/ingredients/paes/PÃO COM GERGELIM GOLD.png' },
  { slug: 'pao-gergelim', nome: 'Pão Gergelim Tradicional', categoria: 'pao', preco: 2, custo: 0.8, ordem: 5, imagem: '/ingredients/paes/PÃO COM GERGELIM TTRADICIONAL.png' },

  // === CARNES ===
  { slug: 'blend-bovino-90-120', nome: 'Blend Bovino 90/120g', categoria: 'carne', preco: 12, custo: 4.8, ordem: 1, imagem: '/ingredients/carnes/1.png' },
  { slug: 'blend-bovino-160', nome: 'Blend Bovino 160g', categoria: 'carne', preco: 18, custo: 7.2, ordem: 2, imagem: '/ingredients/carnes/BLEND BOVINO 160 GRAMAS.png' },
  { slug: 'blend-frango', nome: 'Blend de Frango', categoria: 'carne', preco: 12, custo: 4.2, ordem: 3, imagem: '/ingredients/carnes/BLAND DE FRANGO.png' },
  { slug: 'hamburguer-simples', nome: 'Hambúrguer Simples', categoria: 'carne', preco: 10, custo: 4, ordem: 4, imagem: '/ingredients/carnes/HAMBURGUER SIMPLES.png' },
  { slug: 'costela', nome: 'Costela Desfiada', categoria: 'carne', preco: 20, custo: 8, ordem: 5, imagem: '/ingredients/carnes/COSTELA.png' },
  { slug: 'carne-desfiada', nome: 'Carne Desfiada', categoria: 'carne', preco: 16, custo: 6.4, ordem: 6, imagem: '/ingredients/carnes/CARNE DESFIADA.png' },
  { slug: 'frango-desfiado', nome: 'Frango Desfiado', categoria: 'carne', preco: 14, custo: 5, ordem: 7, imagem: '/ingredients/carnes/FRANGO DESFIADO.png' },
  { slug: 'frango-cubo', nome: 'Frango em Cubos', categoria: 'carne', preco: 14, custo: 5, ordem: 8, imagem: '/ingredients/carnes/FRANGO EM CUBO.png' },
  { slug: 'atum', nome: 'Atum', categoria: 'carne', preco: 18, custo: 8, ordem: 9, imagem: '/ingredients/carnes/ATUM.png' },
  { slug: 'camaroes', nome: 'Camarões', categoria: 'carne', preco: 25, custo: 12, ordem: 10, imagem: '/ingredients/carnes/CAMARÕES.png' },
  { slug: 'tofu', nome: 'Tofu', categoria: 'carne', preco: 12, custo: 4, ordem: 11, imagem: '/ingredients/carnes/TOFU.png' },

  // === QUEIJOS ===
  { slug: 'mussarela-fatiada', nome: 'Mussarela Fatiada', categoria: 'queijo', preco: 3, custo: 1.2, ordem: 1, imagem: '/ingredients/queijos/MUSSARELA FATIADA.png' },
  { slug: 'mussarela-ralada', nome: 'Mussarela Ralada', categoria: 'queijo', preco: 3, custo: 1.2, ordem: 2, imagem: '/ingredients/queijos/MUSSARELA RALADA.png' },
  { slug: 'queijo-mussarela', nome: 'Queijo Mussarela', categoria: 'queijo', preco: 3, custo: 1.2, ordem: 3, imagem: '/ingredients/queijos/QUEIJO MUSSARELA.png' },
  { slug: 'queijo-prato', nome: 'Queijo Prato', categoria: 'queijo', preco: 2.5, custo: 1, ordem: 4, imagem: '/ingredients/queijos/QUEIJO PRATO.png' },
  { slug: 'gorgonzola', nome: 'Gorgonzola', categoria: 'queijo', preco: 6, custo: 3, ordem: 5, imagem: '/ingredients/queijos/QUEIJO GORGONZOLA.png' },
  { slug: 'cream-cheese', nome: 'Cream Cheese', categoria: 'queijo', preco: 4.5, custo: 2, ordem: 6, imagem: '/ingredients/queijos/CREAM CHEESE.png' },
  { slug: 'catupiry', nome: 'Catupiry', categoria: 'queijo', preco: 4, custo: 1.8, ordem: 7, imagem: '/ingredients/queijos/CATUPIRY.png' },
  { slug: 'cheddar', nome: 'Cheddar', categoria: 'queijo', preco: 4, custo: 1.6, ordem: 8, imagem: '/ingredients/queijos/MOLHO CHEDAR.png' },
  { slug: 'parmesao', nome: 'Parmesão Ralado', categoria: 'queijo', preco: 5, custo: 2.5, ordem: 9, imagem: '/ingredients/queijos/PARMESAO RALADO.png' },

  // === MOLHOS ===
  { slug: 'ketchup', nome: 'Ketchup', categoria: 'molho', preco: 0, custo: 0.3, ordem: 1, imagem: '/ingredients/molhos/CATCHUP.png' },
  { slug: 'mostarda', nome: 'Mostarda', categoria: 'molho', preco: 0, custo: 0.3, ordem: 2, imagem: '/ingredients/molhos/MOSTARDA.png' },
  { slug: 'maionese', nome: 'Maionese', categoria: 'molho', preco: 0, custo: 0.4, ordem: 3, imagem: '/ingredients/molhos/MAIONESE.png' },
  { slug: 'barbecue', nome: 'Barbecue', categoria: 'molho', preco: 2, custo: 0.8, ordem: 4, imagem: '/ingredients/molhos/MOLHO BARBECUE.png' },
  { slug: 'molho-verde', nome: 'Molho Verde', categoria: 'molho', preco: 2, custo: 0.8, ordem: 5, imagem: '/ingredients/molhos/MOLHO VERDE.png' },
  { slug: 'billy-jack', nome: 'Billy & Jack', categoria: 'molho', preco: 3, custo: 1.2, ordem: 6, imagem: '/ingredients/molhos/MOLHO BILLY E JACK.png' },
  { slug: 'molho-shoyu', nome: 'Molho Shoyu', categoria: 'molho', preco: 2, custo: 0.5, ordem: 7, imagem: '/ingredients/molhos/MOLHO SHOYU.png' },
  { slug: 'geleia-pimenta', nome: 'Geléia de Pimenta', categoria: 'molho', preco: 4, custo: 1.8, ordem: 8, imagem: '/ingredients/molhos/GELEIA DE PIMENTA.png' },

  // === VEGETAIS ===
  { slug: 'alface', nome: 'Alface', categoria: 'vegetal', preco: 1, custo: 0.3, ordem: 1, imagem: '/ingredients/vegetais/ALFACE.png' },
  { slug: 'tomate', nome: 'Tomate', categoria: 'vegetal', preco: 1, custo: 0.4, ordem: 2, imagem: '/ingredients/vegetais/TOMATE.png' },
  { slug: 'cebola', nome: 'Cebola', categoria: 'vegetal', preco: 1, custo: 0.3, ordem: 3, imagem: '/ingredients/vegetais/CEBOLA.png' },
  { slug: 'cebola-branca', nome: 'Cebola Branca', categoria: 'vegetal', preco: 1, custo: 0.3, ordem: 4, imagem: '/ingredients/vegetais/CEBOLA BRANCA.png' },
  { slug: 'cebola-roxa', nome: 'Cebola Roxa', categoria: 'vegetal', preco: 1.5, custo: 0.5, ordem: 5, imagem: '/ingredients/vegetais/CEBOLA ROXA.png' },
  { slug: 'cebola-rodela', nome: 'Cebola em Rodelas', categoria: 'vegetal', preco: 1, custo: 0.3, ordem: 6, imagem: '/ingredients/vegetais/CEBOLA RODELA.png' },
  { slug: 'cebola-caramelizada', nome: 'Cebola Caramelizada', categoria: 'vegetal', preco: 3, custo: 1, ordem: 7, imagem: '/ingredients/vegetais/CEBOLA CARAMELIZADA.png' },
  { slug: 'cebola-crispy', nome: 'Cebola Crispy', categoria: 'vegetal', preco: 3, custo: 1, ordem: 8, imagem: '/ingredients/vegetais/CEBOLA CRISPY.png' },
  { slug: 'picles', nome: 'Picles', categoria: 'vegetal', preco: 2, custo: 0.6, ordem: 9, imagem: '/ingredients/vegetais/PICLES.png' },
  { slug: 'azeitona', nome: 'Azeitona', categoria: 'vegetal', preco: 2, custo: 0.8, ordem: 10, imagem: '/ingredients/vegetais/AZEITONA.png' },
  { slug: 'ervilha', nome: 'Ervilha', categoria: 'vegetal', preco: 2, custo: 0.5, ordem: 11, imagem: '/ingredients/vegetais/ERVILHA.png' },
  { slug: 'milho', nome: 'Milho', categoria: 'vegetal', preco: 2, custo: 0.5, ordem: 12, imagem: '/ingredients/vegetais/MILHO.png' },

  // === EXTRAS ===
  { slug: 'bacon-fatiado', nome: 'Bacon Fatiado', categoria: 'extra', preco: 5, custo: 2.5, ordem: 1, imagem: '/ingredients/extras/BACON FATIADO.png' },
  { slug: 'bacon-crispy', nome: 'Bacon Crispy', categoria: 'extra', preco: 6, custo: 3, ordem: 2, imagem: '/ingredients/extras/BACON CRISPY.png' },
  { slug: 'bacon-cubo', nome: 'Bacon em Cubos', categoria: 'extra', preco: 5, custo: 2.5, ordem: 3, imagem: '/ingredients/extras/BACON CUBO.png' },
  { slug: 'bacon-tiras', nome: 'Bacon em Tiras', categoria: 'extra', preco: 5, custo: 2.5, ordem: 4, imagem: '/ingredients/extras/BACON TIRAS.png' },
  { slug: 'ovo-frito', nome: 'Ovo Frito', categoria: 'extra', preco: 3, custo: 0.8, ordem: 5, imagem: '/ingredients/extras/OVO FRITO.png' },
  { slug: 'doritos', nome: 'Doritos', categoria: 'extra', preco: 3, custo: 1.2, ordem: 6, imagem: '/ingredients/extras/DORITOS.png' },
  { slug: 'batata-palha', nome: 'Batata Palha', categoria: 'extra', preco: 2, custo: 0.8, ordem: 7, imagem: '/ingredients/extras/BATATA PALHA.png' },
  { slug: 'aneis-cebola', nome: 'Anéis de Cebola', categoria: 'extra', preco: 5, custo: 1.5, ordem: 8, imagem: '/ingredients/extras/ANEIS DE CEBOLA.png' },
  { slug: 'calabresa', nome: 'Calabresa Fatiada', categoria: 'extra', preco: 4, custo: 2, ordem: 9, imagem: '/ingredients/extras/CALABRESA FATIADA.png' },
  { slug: 'salame', nome: 'Salame', categoria: 'extra', preco: 5, custo: 2.5, ordem: 10, imagem: '/ingredients/extras/SALAME.png' },

  // === ESPECIAIS ===
  { slug: 'passas', nome: 'Passas', categoria: 'especial', preco: 2, custo: 1, ordem: 1, imagem: '/ingredients/extras/PASSAS.png' },
];

// Acompanhamentos (combos)
const acompanhamentos = [
  { slug: 'batata', nome: 'Batata Frita', preco: 12, custo: 3.5, ordem: 1, estoqueMinimo: 20 },
  { slug: 'refri-lata', nome: 'Refrigerante Lata', preco: 6, custo: 2, ordem: 2, estoqueMinimo: 50 },
  { slug: 'refri-1l', nome: 'Refrigerante 1L', preco: 10, custo: 4, ordem: 3, estoqueMinimo: 20 },
  { slug: 'sobremesa', nome: 'Sobremesa do Dia', preco: 8, custo: 3, ordem: 4, estoqueMinimo: 15 },
  { slug: 'agua', nome: 'Água Mineral', preco: 4, custo: 1, ordem: 5, estoqueMinimo: 50 },
  { slug: 'suco', nome: 'Suco Natural', preco: 8, custo: 3, ordem: 6, estoqueMinimo: 20 },
  { slug: 'milkshake', nome: 'Milkshake', preco: 15, custo: 5, ordem: 7, estoqueMinimo: 15 },
  { slug: 'onion-rings', nome: 'Onion Rings', preco: 14, custo: 4, ordem: 8, estoqueMinimo: 20 },
];

// Configurações iniciais
const configuracoes = [
  { chave: 'taxa_entrega', valor: '5', tipo: 'number', descricao: 'Taxa de entrega padrão em R$' },
  { chave: 'taxa_entrega_gratis_acima', valor: '50', tipo: 'number', descricao: 'Valor mínimo para entrega grátis em R$' },
  { chave: 'horario_abertura', valor: '11:00', tipo: 'string', descricao: 'Horário de abertura' },
  { chave: 'horario_fechamento', valor: '23:00', tipo: 'string', descricao: 'Horário de fechamento' },
  { chave: 'tempo_preparo_minutos', valor: '20', tipo: 'number', descricao: 'Tempo médio de preparo em minutos' },
  { chave: 'aceita_pedidos', valor: 'true', tipo: 'boolean', descricao: 'Se a loja está aceitando pedidos' },
];

async function main() {
  console.log('Iniciando seed do banco de dados...');

  // 1. Criar categorias
  console.log('Criando categorias...');
  const categoriasMap: Record<string, string> = {};

  for (const cat of categorias) {
    const categoria = await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {
        nome: cat.nome,
        cor: cat.cor,
        ordem: cat.ordem
      },
      create: {
        slug: cat.slug,
        nome: cat.nome,
        cor: cat.cor,
        ordem: cat.ordem,
        ativo: true
      }
    });
    categoriasMap[cat.slug] = categoria.id;
  }
  console.log(`${categorias.length} categorias criadas/atualizadas.`);

  // 2. Criar ingredientes
  console.log('Criando ingredientes...');
  for (const ing of ingredientes) {
    const categoriaId = categoriasMap[ing.categoria];
    if (!categoriaId) {
      console.warn(`Categoria não encontrada para ingrediente: ${ing.slug}`);
      continue;
    }

    await prisma.ingrediente.upsert({
      where: { slug: ing.slug },
      update: {
        nome: ing.nome,
        preco: ing.preco,
        custo: ing.custo,
        ordem: ing.ordem,
        imagem: ing.imagem,
        categoriaId
      },
      create: {
        slug: ing.slug,
        nome: ing.nome,
        preco: ing.preco,
        custo: ing.custo,
        estoque: 100, // Estoque inicial
        estoqueMinimo: 10,
        unidade: 'un',
        ordem: ing.ordem,
        imagem: ing.imagem,
        categoriaId,
        ativo: true
      }
    });
  }
  console.log(`${ingredientes.length} ingredientes criados/atualizados.`);

  // 3. Criar acompanhamentos
  console.log('Criando acompanhamentos...');
  for (const ac of acompanhamentos) {
    await prisma.acompanhamento.upsert({
      where: { slug: ac.slug },
      update: {
        nome: ac.nome,
        preco: ac.preco,
        custo: ac.custo,
        ordem: ac.ordem,
        estoqueMinimo: ac.estoqueMinimo
      },
      create: {
        slug: ac.slug,
        nome: ac.nome,
        preco: ac.preco,
        custo: ac.custo,
        estoque: 100, // Estoque inicial
        estoqueMinimo: ac.estoqueMinimo,
        unidade: 'un',
        ordem: ac.ordem,
        ativo: true
      }
    });
  }
  console.log(`${acompanhamentos.length} acompanhamentos criados/atualizados.`);

  // 4. Criar configurações
  console.log('Criando configurações...');
  for (const config of configuracoes) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: {
        valor: config.valor,
        tipo: config.tipo,
        descricao: config.descricao
      },
      create: {
        chave: config.chave,
        valor: config.valor,
        tipo: config.tipo,
        descricao: config.descricao
      }
    });
  }
  console.log(`${configuracoes.length} configurações criadas/atualizadas.`);

  console.log('\nSeed concluído com sucesso!');

  // Resumo
  const totalCategorias = await prisma.categoria.count();
  const totalIngredientes = await prisma.ingrediente.count();
  const totalAcompanhamentos = await prisma.acompanhamento.count();
  const totalConfiguracoes = await prisma.configuracao.count();

  console.log('\nResumo:');
  console.log(`- Categorias: ${totalCategorias}`);
  console.log(`- Ingredientes: ${totalIngredientes}`);
  console.log(`- Acompanhamentos: ${totalAcompanhamentos}`);
  console.log(`- Configurações: ${totalConfiguracoes}`);
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
