import { getIngredientImage } from '@/lib/assets/ingredientImages';

type FallbackCategoria = {
  id: string;
  slug: string;
  nome: string;
  cor: string;
  ordem: number;
};

type FallbackIngrediente = {
  id: string;
  slug: string;
  nome: string;
  preco: number;
  imagem: string | null;
  categoriaSlug: string;
  categoria: FallbackCategoria;
  ordem: number;
};

const fallbackCategorias: Record<string, FallbackCategoria> = {
  pao: { id: 'fallback-categoria-pao', slug: 'pao', nome: 'Pães', cor: '#f5d490', ordem: 10 },
  carne: { id: 'fallback-categoria-carne', slug: 'carne', nome: 'Carnes', cor: '#d96b4a', ordem: 20 },
  queijo: { id: 'fallback-categoria-queijo', slug: 'queijo', nome: 'Queijos', cor: '#f5b14b', ordem: 30 },
  molho: { id: 'fallback-categoria-molho', slug: 'molho', nome: 'Molhos', cor: '#f48fb1', ordem: 40 },
  vegetais: { id: 'fallback-categoria-vegetais', slug: 'vegetais', nome: 'Vegetais', cor: '#8bc34a', ordem: 50 },
  extras: { id: 'fallback-categoria-extras', slug: 'extras', nome: 'Extras', cor: '#90caf9', ordem: 60 },
  especial: { id: 'fallback-categoria-especial', slug: 'especial', nome: 'Especial', cor: '#ce93d8', ordem: 70 },
};

const fallbackIngredientesSeed = [
  { slug: 'pao-brioche', nome: 'Pão Brioche', categoriaSlug: 'pao', preco: 0, ordem: 1 },
  { slug: 'blend-bovino-90g', nome: 'Blend Bovino 90g', categoriaSlug: 'carne', preco: 8, ordem: 1 },
  { slug: 'queijo-cheddar', nome: 'Cheddar', categoriaSlug: 'queijo', preco: 3, ordem: 1 },
  { slug: 'alface', nome: 'Alface', categoriaSlug: 'vegetais', preco: 0, ordem: 1 },
  { slug: 'bacon', nome: 'Bacon', categoriaSlug: 'extras', preco: 4, ordem: 1 },
  { slug: 'maionese', nome: 'Maionese', categoriaSlug: 'molho', preco: 0, ordem: 1 },
  { slug: 'molho-costa-especial', nome: 'Molho Costa Especial', categoriaSlug: 'especial', preco: 2, ordem: 1 },
];

export const fallbackCatalogIngredients: FallbackIngrediente[] = fallbackIngredientesSeed.map((ingrediente) => {
  const categoria = fallbackCategorias[ingrediente.categoriaSlug];
  const imagem =
    getIngredientImage(ingrediente.slug) || getIngredientImage(ingrediente.categoriaSlug) || null;

  return {
    id: `fallback-${ingrediente.slug}`,
    slug: ingrediente.slug,
    nome: ingrediente.nome,
    preco: ingrediente.preco,
    imagem,
    categoriaSlug: ingrediente.categoriaSlug,
    categoria,
    ordem: ingrediente.ordem,
  } satisfies FallbackIngrediente;
});
