import { CatalogCategorySlug, getIngredientImage, HAMBURGER_BASE_IMAGE } from '@/lib/assets/ingredientImages';

export type CatalogCategoryManifest = {
  slug: CatalogCategorySlug;
  nome: string;
  cor?: string | null;
  ordem: number;
  ativo?: boolean;
};

export type CatalogIngredientManifest = {
  slug: string;
  nome: string;
  categoriaSlug: CatalogCategorySlug;
  ordem: number;
  preco: number;
  custo: number;
  imagemPath: string;
  ativo?: boolean;
};

const categories: CatalogCategoryManifest[] = [
  { slug: 'pao', nome: 'Pães', cor: '#f5d490', ordem: 10, ativo: true },
  { slug: 'carne', nome: 'Carnes', cor: '#d96b4a', ordem: 20, ativo: true },
  { slug: 'queijo', nome: 'Queijos', cor: '#f5b14b', ordem: 30, ativo: true },
  { slug: 'molho', nome: 'Molhos', cor: '#f48fb1', ordem: 40, ativo: true },
  { slug: 'vegetais', nome: 'Vegetais', cor: '#8bc34a', ordem: 50, ativo: true },
  { slug: 'extras', nome: 'Extras', cor: '#90caf9', ordem: 60, ativo: true },
  { slug: 'especial', nome: 'Especial', cor: '#ce93d8', ordem: 70, ativo: true },
];

const rawIngredients: Array<Omit<CatalogIngredientManifest, 'imagemPath'>> = [
  { slug: 'pao-brioche', nome: 'Pão Brioche', categoriaSlug: 'pao', ordem: 1, preco: 0, custo: 1 },
  { slug: 'pao-com-gergelim-ttradicional', nome: 'Pão com Gergelim', categoriaSlug: 'pao', ordem: 2, preco: 0, custo: 1 },
  { slug: 'pao-com-gergelim-gold', nome: 'Pão Gergelim Gold', categoriaSlug: 'pao', ordem: 3, preco: 1, custo: 1 },
  { slug: 'pao-australiano', nome: 'Pão Australiano', categoriaSlug: 'pao', ordem: 4, preco: 2, custo: 1 },

  { slug: 'blend-bovino-160-gramas', nome: 'Blend Bovino 160g', categoriaSlug: 'carne', ordem: 1, preco: 10, custo: 5 },
  { slug: 'hamburguer-simples', nome: 'Hambúrguer Simples', categoriaSlug: 'carne', ordem: 2, preco: 8, custo: 4 },
  { slug: 'costela', nome: 'Carne de Costela', categoriaSlug: 'carne', ordem: 3, preco: 11, custo: 6 },
  { slug: 'frango-desfiado', nome: 'Frango Desfiado', categoriaSlug: 'carne', ordem: 4, preco: 8, custo: 4 },
  { slug: 'tofu', nome: 'Tofu', categoriaSlug: 'carne', ordem: 5, preco: 9, custo: 5 },

  { slug: 'queijo-prato', nome: 'Queijo Prato', categoriaSlug: 'queijo', ordem: 1, preco: 3, custo: 1.5 },
  { slug: 'queijo-mussarela', nome: 'Mussarela', categoriaSlug: 'queijo', ordem: 2, preco: 3, custo: 1.5 },
  { slug: 'catupiry', nome: 'Catupiry', categoriaSlug: 'queijo', ordem: 3, preco: 3, custo: 1.5 },
  { slug: 'molho-chedar', nome: 'Cheddar Cream', categoriaSlug: 'queijo', ordem: 4, preco: 3, custo: 1.5 },

  { slug: 'maionese', nome: 'Maionese Artesanal', categoriaSlug: 'molho', ordem: 1, preco: 0, custo: 0.5 },
  { slug: 'molho-barbecue', nome: 'Barbecue', categoriaSlug: 'molho', ordem: 2, preco: 1, custo: 0.5 },
  { slug: 'catchup', nome: 'Ketchup', categoriaSlug: 'molho', ordem: 3, preco: 0, custo: 0.5 },
  { slug: 'mostarda', nome: 'Mostarda', categoriaSlug: 'molho', ordem: 4, preco: 0, custo: 0.5 },
  { slug: 'molho-verde', nome: 'Molho Verde', categoriaSlug: 'molho', ordem: 5, preco: 1, custo: 0.5 },

  { slug: 'alface', nome: 'Alface', categoriaSlug: 'vegetais', ordem: 1, preco: 0, custo: 0.5 },
  { slug: 'tomate', nome: 'Tomate', categoriaSlug: 'vegetais', ordem: 2, preco: 0, custo: 0.5 },
  { slug: 'cebola-roxa', nome: 'Cebola Roxa', categoriaSlug: 'vegetais', ordem: 3, preco: 0, custo: 0.5 },
  { slug: 'picles', nome: 'Picles', categoriaSlug: 'vegetais', ordem: 4, preco: 0, custo: 0.5 },
  { slug: 'milho', nome: 'Milho', categoriaSlug: 'vegetais', ordem: 5, preco: 0, custo: 0.5 },

  { slug: 'bacon-fatiado', nome: 'Bacon', categoriaSlug: 'extras', ordem: 1, preco: 4, custo: 2 },
  { slug: 'doritos', nome: 'Doritos', categoriaSlug: 'extras', ordem: 2, preco: 3, custo: 1.5 },
  { slug: 'ovo-frito', nome: 'Ovo Frito', categoriaSlug: 'extras', ordem: 3, preco: 2, custo: 1 },
  { slug: 'batata-palha', nome: 'Batata Palha', categoriaSlug: 'extras', ordem: 4, preco: 2, custo: 1 },
  { slug: 'aneis-de-cebola', nome: 'Anéis de Cebola', categoriaSlug: 'extras', ordem: 5, preco: 3, custo: 1.5 },
  { slug: 'bacon-crispy', nome: 'Bacon Crispy', categoriaSlug: 'extras', ordem: 6, preco: 4, custo: 2 },

  { slug: 'molho-billy-e-jack', nome: 'Molho Costa Especial', categoriaSlug: 'especial', ordem: 1, preco: 3, custo: 1.5 },
];

const ingredients: CatalogIngredientManifest[] = rawIngredients
  .map((ingredient) => ({
    ...ingredient,
    imagemPath: getIngredientImage(ingredient.slug) || getIngredientImage(ingredient.categoriaSlug) || HAMBURGER_BASE_IMAGE,
    ativo: true,
  }))
  .filter((ingredient) => Boolean(ingredient.imagemPath));

export const catalogManifest = {
  categories,
  ingredients,
  burgerBaseImage: HAMBURGER_BASE_IMAGE,
  defaultStack: [
    'pao-brioche',
    'blend-bovino-160-gramas',
    'queijo-prato',
    'tomate',
    'alface',
    'maionese',
  ],
};

export type CatalogManifest = typeof catalogManifest;
