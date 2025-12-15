import { PrismaClient } from '@prisma/client';
import { getIngredientImage } from '@/lib/assets/ingredientImages';

const prisma = new PrismaClient();

const categoriasSeed = [
  { slug: 'pao', nome: 'Pães', cor: '#f5d490', ordem: 10 },
  { slug: 'carne', nome: 'Carnes', cor: '#d96b4a', ordem: 20 },
  { slug: 'queijo', nome: 'Queijos', cor: '#f5b14b', ordem: 30 },
  { slug: 'molho', nome: 'Molhos', cor: '#f48fb1', ordem: 40 },
  { slug: 'vegetais', nome: 'Vegetais', cor: '#8bc34a', ordem: 50 },
  { slug: 'extras', nome: 'Extras', cor: '#90caf9', ordem: 60 },
  { slug: 'especial', nome: 'Especial', cor: '#ce93d8', ordem: 70 },
];

const ingredientesSeed = [
  { slug: 'pao-brioche', nome: 'Pão Brioche', categoriaSlug: 'pao', preco: 0, ordem: 1 },
  { slug: 'blend-bovino-90g', nome: 'Blend Bovino 90g', categoriaSlug: 'carne', preco: 8, ordem: 1 },
  { slug: 'queijo-cheddar', nome: 'Cheddar', categoriaSlug: 'queijo', preco: 3, ordem: 1 },
  { slug: 'alface', nome: 'Alface', categoriaSlug: 'vegetais', preco: 0, ordem: 1 },
  { slug: 'bacon', nome: 'Bacon', categoriaSlug: 'extras', preco: 4, ordem: 1 },
  { slug: 'maionese', nome: 'Maionese', categoriaSlug: 'molho', preco: 0, ordem: 1 },
  { slug: 'molho-costa-especial', nome: 'Molho Costa Especial', categoriaSlug: 'especial', preco: 2, ordem: 1 },
];

async function main() {
  console.log('> Iniciando seed de categorias...');
  const categorias = await Promise.all(
    categoriasSeed.map((categoria) =>
      prisma.categoria.upsert({
        where: { slug: categoria.slug },
        update: { ...categoria, ativo: true },
        create: { ...categoria, ativo: true },
      })
    )
  );

  const categoriaIdPorSlug = categorias.reduce<Record<string, string>>((acc, categoria) => {
    acc[categoria.slug] = categoria.id;
    return acc;
  }, {});

  console.log('> Inserindo ingredientes base...');

  for (const ingrediente of ingredientesSeed) {
    const categoriaId = categoriaIdPorSlug[ingrediente.categoriaSlug];
    if (!categoriaId) continue;

    const imagem = getIngredientImage(ingrediente.slug);

    await prisma.ingrediente.upsert({
      where: { slug: ingrediente.slug },
      update: {
        nome: ingrediente.nome,
        preco: ingrediente.preco,
        custo: ingrediente.preco / 2,
        categoriaId,
        imagem: imagem || null,
        ativo: true,
        ordem: ingrediente.ordem,
      },
      create: {
        slug: ingrediente.slug,
        nome: ingrediente.nome,
        preco: ingrediente.preco,
        custo: ingrediente.preco / 2,
        categoriaId,
        imagem: imagem || null,
        ativo: true,
        estoque: 10,
        estoqueMinimo: 2,
        unidade: 'un',
        ordem: ingrediente.ordem,
      },
    });
  }

  console.log('> Catálogo pronto!');
}

main()
  .catch((error) => {
    console.error('Erro ao rodar seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
