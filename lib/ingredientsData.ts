export type IngredientCategorySlug = 'pao' | 'carne' | 'queijo' | 'salada' | 'molho' | 'extra';
export type IngredientDataItem = {
  slug: string;
  nome: string;
  categoria: IngredientCategorySlug;
  preco: number;
  custo?: number;
  imagem?: string | null;
};

export const ingredientsData: IngredientDataItem[] = [
  { slug: 'pao-brioche', nome: 'Pão Brioche', categoria: 'pao', preco: 0, custo: 0 },
  { slug: 'blend-bovino-90', nome: 'Blend Bovino 90g', categoria: 'carne', preco: 0, custo: 0 },
  { slug: 'queijo-cheddar', nome: 'Cheddar', categoria: 'queijo', preco: 0, custo: 0 },
  { slug: 'alface', nome: 'Alface', categoria: 'salada', preco: 0, custo: 0 },
  { slug: 'tomate', nome: 'Tomate', categoria: 'salada', preco: 0, custo: 0 },
  { slug: 'maionese', nome: 'Maionese', categoria: 'molho', preco: 0, custo: 0 },
];

export function groupIngredientsByCategory(list: IngredientDataItem[] = ingredientsData) {
  return list.reduce<Record<string, IngredientDataItem[]>>((acc, item) => {
    acc[item.categoria] = acc[item.categoria] || [];
    acc[item.categoria].push(item);
    return acc;
  }, {});
}

export type IngredientCategory = 'pao' | 'carne' | 'queijo' | 'molho' | 'vegetal' | 'extra' | 'especial';

export type Ingredient = {
  id: string;
  name: string;
  price: number;
  category: IngredientCategory;
  image: string;
};

export const HAMBURGER_BASE_IMAGE = '/hamburger-base.png';

export const CATEGORIAS: Record<IngredientCategory, { label: string; cor: string }> = {
  pao: { label: 'Pão', cor: '#f5d490' },
  carne: { label: 'Carne', cor: '#d96b4a' },
  queijo: { label: 'Queijo', cor: '#f5b14b' },
  molho: { label: 'Molho', cor: '#f48fb1' },
  vegetal: { label: 'Vegetais', cor: '#8bc34a' },
  extra: { label: 'Extras', cor: '#90caf9' },
  especial: { label: 'Especial', cor: '#ce93d8' },
};

const INGREDIENTES: Ingredient[] = [
  { id: 'pao-brioche', name: 'Pão Brioche', price: 0, category: 'pao', image: '/ingredients/pao-brioche.png' },
  { id: 'pao-australiano', name: 'Pão Australiano', price: 4, category: 'pao', image: '/ingredients/pao-australiano.png' },
  { id: 'blend-bovino-90', name: 'Blend Bovino 90g', price: 8, category: 'carne', image: '/ingredients/blend-bovino-90.png' },
  { id: 'frango-grelhado', name: 'Frango Grelhado', price: 7, category: 'carne', image: '/ingredients/frango-grelhado.png' },
  { id: 'queijo-cheddar', name: 'Cheddar', price: 3, category: 'queijo', image: '/ingredients/queijo-cheddar.png' },
  { id: 'queijo-mussarela', name: 'Mussarela', price: 2.5, category: 'queijo', image: '/ingredients/queijo-mussarela.png' },
  { id: 'maionese', name: 'Maionese', price: 0, category: 'molho', image: '/ingredients/maionese.png' },
  { id: 'barbecue', name: 'Barbecue', price: 1.5, category: 'molho', image: '/ingredients/barbecue.png' },
  { id: 'alface', name: 'Alface', price: 0, category: 'vegetal', image: '/ingredients/alface.png' },
  { id: 'tomate', name: 'Tomate', price: 0, category: 'vegetal', image: '/ingredients/tomate.png' },
  { id: 'bacon', name: 'Bacon', price: 4, category: 'extra', image: '/ingredients/bacon.png' },
  { id: 'ovo', name: 'Ovo', price: 2, category: 'extra', image: '/ingredients/ovo.png' },
  { id: 'costa-special', name: 'Molho Costa Special', price: 2, category: 'especial', image: '/ingredients/costa-special.png' },
];

export function getIngredientePorId(id: string): Ingredient | undefined {
  return INGREDIENTES.find((item) => item.id === id);
}

export function getIngredientesPorCategoria(category: IngredientCategory): Ingredient[] {
  return INGREDIENTES.filter((item) => item.category === category);
}

export function calcularPrecoTotal(ids: string[]): number {
  return ids.reduce((total, id) => {
    const ing = getIngredientePorId(id);
    return total + (ing?.price ?? 0);
  }, 0);
}
