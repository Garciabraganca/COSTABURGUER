// Mapeamento de ingredientes utilizando as páginas de catálogo como sprite sheets

export type IngredientCategory =
  | 'pao'
  | 'carne'
  | 'queijo'
  | 'molho'
  | 'extra'
  | 'vegetal'
  | 'especial';

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  category: IngredientCategory;
  sheet: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

const GRID_COLUMNS = 12;
const GRID_ROWS = 6;
export const SPRITE_CELL_SIZE = 189;
export const SPRITE_SHEETS = [
  '/ingredients/catalogo-1.png',
  '/ingredients/catalogo-2.png',
  '/ingredients/catalogo-3.png',
];

export const SPRITE_SHEET_SIZE = {
  width: SPRITE_CELL_SIZE * GRID_COLUMNS,
  height: SPRITE_CELL_SIZE * GRID_ROWS,
};

function spriteFromSlot(slot: number) {
  const sheetIndex = Math.floor(slot / (GRID_COLUMNS * GRID_ROWS));
  const localSlot = slot % (GRID_COLUMNS * GRID_ROWS);
  const column = localSlot % GRID_COLUMNS;
  const row = Math.floor(localSlot / GRID_COLUMNS);

  return {
    sheet: SPRITE_SHEETS[Math.min(sheetIndex, SPRITE_SHEETS.length - 1)],
    x: column * SPRITE_CELL_SIZE,
    y: row * SPRITE_CELL_SIZE,
    width: SPRITE_CELL_SIZE,
    height: SPRITE_CELL_SIZE,
  } satisfies Pick<Ingredient, 'sheet' | 'x' | 'y' | 'width' | 'height'>;
}

let currentSlot = 0;
function nextSpriteSlot(slot?: number) {
  if (typeof slot === 'number') {
    return spriteFromSlot(slot);
  }

  const sprite = spriteFromSlot(currentSlot);
  currentSlot += 1;
  return sprite;
}

function makeIngredient(
  data: Omit<Ingredient, 'sheet' | 'x' | 'y' | 'width' | 'height'> & {
    slot?: number;
  }
): Ingredient {
  const sprite = nextSpriteSlot(data.slot);
  const { slot, ...rest } = data;
  return { ...rest, ...sprite } satisfies Ingredient;
}

// Categorias para organização visual
export const CATEGORIAS = {
  pao: { label: 'Pães', cor: '#f9c46b' },
  carne: { label: 'Carnes', cor: '#5b3620' },
  queijo: { label: 'Queijos', cor: '#f4d25a' },
  molho: { label: 'Molhos', cor: '#c0392b' },
  extra: { label: 'Extras', cor: '#e67e22' },
  vegetal: { label: 'Vegetais', cor: '#27ae60' },
  especial: { label: 'Especiais', cor: '#9b59b6' },
};

// Ingredientes extraídos das imagens do catálogo
export const ingredients: Ingredient[] = [
  // === PÃES (Base e Topo) ===
  makeIngredient({ id: 'pao-australiano-base', name: 'Pão Australiano (Base)', category: 'pao', price: 3, order: 1 }),
  makeIngredient({ id: 'pao-australiano-topo', name: 'Pão Australiano (Topo)', category: 'pao', price: 0, order: 100 }),
  makeIngredient({ id: 'pao-brioche-base', name: 'Pão Brioche (Base)', category: 'pao', price: 2.5, order: 1 }),
  makeIngredient({ id: 'pao-brioche-topo', name: 'Pão Brioche (Topo)', category: 'pao', price: 0, order: 100 }),
  makeIngredient({ id: 'pao-beterraba-base', name: 'Pão Beterraba (Base)', category: 'pao', price: 4, order: 1 }),
  makeIngredient({ id: 'pao-beterraba-topo', name: 'Pão Beterraba (Topo)', category: 'pao', price: 0, order: 100 }),
  makeIngredient({ id: 'pao-gergelin-base', name: 'Pão Gergelim (Base)', category: 'pao', price: 2, order: 1 }),
  makeIngredient({ id: 'pao-gergelin-topo', name: 'Pão Gergelim (Topo)', category: 'pao', price: 0, order: 100 }),
  makeIngredient({ id: 'pao-gergelin-gold-base', name: 'Pão Gergelim Gold (Base)', category: 'pao', price: 3.5, order: 1 }),
  makeIngredient({ id: 'pao-gergelin-gold-topo', name: 'Pão Gergelim Gold (Topo)', category: 'pao', price: 0, order: 100 }),
  makeIngredient({ id: 'pao-gergelin-black-base', name: 'Pão Gergelim Black (Base)', category: 'pao', price: 4, order: 1 }),
  makeIngredient({ id: 'pao-gergelin-black-topo', name: 'Pão Gergelim Black (Topo)', category: 'pao', price: 0, order: 100 }),

  // === CARNES ===
  makeIngredient({ id: 'smash-70g', name: 'Smash 70g', category: 'carne', price: 8, order: 20 }),
  makeIngredient({ id: 'smash-90g', name: 'Smash 90g', category: 'carne', price: 10, order: 20 }),
  makeIngredient({ id: 'smash-120g', name: 'Smash 120g', category: 'carne', price: 12, order: 20 }),
  makeIngredient({ id: 'blend-bovino-90', name: 'Blend Bovino 90g', category: 'carne', price: 11, order: 20 }),
  makeIngredient({ id: 'blend-bovino-120', name: 'Blend Bovino 120g', category: 'carne', price: 14, order: 20 }),
  makeIngredient({ id: 'blend-bovino-160', name: 'Blend Bovino 160g', category: 'carne', price: 18, order: 20 }),
  makeIngredient({ id: 'blend-bovino-200', name: 'Blend Bovino 200g', category: 'carne', price: 22, order: 20 }),
  makeIngredient({ id: 'blend-frango', name: 'Blend de Frango', category: 'carne', price: 12, order: 20 }),
  makeIngredient({ id: 'blend-vegetariano', name: 'Blend Vegetariano', category: 'carne', price: 14, order: 20 }),
  makeIngredient({ id: 'frango-empanado', name: 'Frango Empanado', category: 'carne', price: 15, order: 20 }),
  makeIngredient({ id: 'costela-desfiada', name: 'Costela Desfiada', category: 'carne', price: 20, order: 20 }),
  makeIngredient({ id: 'carne-desfiada', name: 'Carne Desfiada', category: 'carne', price: 16, order: 20 }),

  // === QUEIJOS ===
  makeIngredient({ id: 'cheddar-fatia', name: 'Cheddar (Fatia)', category: 'queijo', price: 3, order: 30 }),
  makeIngredient({ id: 'cheddar-cremoso', name: 'Cheddar Cremoso', category: 'queijo', price: 4, order: 30 }),
  makeIngredient({ id: 'mussarela-fatia', name: 'Mussarela (Fatia)', category: 'queijo', price: 2.5, order: 30 }),
  makeIngredient({ id: 'mussarela-ralada', name: 'Mussarela Ralada', category: 'queijo', price: 3, order: 30 }),
  makeIngredient({ id: 'prato-fatia', name: 'Queijo Prato (Fatia)', category: 'queijo', price: 2.5, order: 30 }),
  makeIngredient({ id: 'provolone', name: 'Provolone', category: 'queijo', price: 4, order: 30 }),
  makeIngredient({ id: 'cream-cheese', name: 'Cream Cheese', category: 'queijo', price: 4.5, order: 30 }),
  makeIngredient({ id: 'catupiry', name: 'Catupiry', category: 'queijo', price: 4, order: 30 }),
  makeIngredient({ id: 'queijo-coalho', name: 'Queijo Coalho', category: 'queijo', price: 5, order: 30 }),
  makeIngredient({ id: 'gorgonzola', name: 'Gorgonzola', category: 'queijo', price: 6, order: 30 }),

  // === MOLHOS ===
  makeIngredient({ id: 'ketchup', name: 'Ketchup', category: 'molho', price: 0, order: 40 }),
  makeIngredient({ id: 'mostarda', name: 'Mostarda', category: 'molho', price: 0, order: 40 }),
  makeIngredient({ id: 'maionese', name: 'Maionese', category: 'molho', price: 0, order: 40 }),
  makeIngredient({ id: 'barbecue', name: 'Barbecue', category: 'molho', price: 2, order: 40 }),
  makeIngredient({ id: 'molho-verde', name: 'Molho Verde', category: 'molho', price: 2, order: 40 }),
  makeIngredient({ id: 'molho-rose', name: 'Molho Rosé', category: 'molho', price: 2, order: 40 }),
  makeIngredient({ id: 'molho-especial', name: 'Molho Especial', category: 'molho', price: 3, order: 40 }),
  makeIngredient({ id: 'billy-jack', name: 'Billy & Jack', category: 'molho', price: 3, order: 40 }),
  makeIngredient({ id: 'molho-shoyu', name: 'Molho Shoyu', category: 'molho', price: 2, order: 40 }),
  makeIngredient({ id: 'geleia-pimenta', name: 'Geléia de Pimenta', category: 'molho', price: 4, order: 40 }),

  // === VEGETAIS ===
  makeIngredient({ id: 'alface', name: 'Alface', category: 'vegetal', price: 1, order: 50 }),
  makeIngredient({ id: 'tomate', name: 'Tomate', category: 'vegetal', price: 1, order: 50 }),
  makeIngredient({ id: 'cebola-rodela', name: 'Cebola (Rodelas)', category: 'vegetal', price: 1, order: 50 }),
  makeIngredient({ id: 'cebola-roxa', name: 'Cebola Roxa', category: 'vegetal', price: 1.5, order: 50 }),
  makeIngredient({ id: 'cebola-caramelizada', name: 'Cebola Caramelizada', category: 'vegetal', price: 3, order: 50 }),
  makeIngredient({ id: 'picles', name: 'Picles', category: 'vegetal', price: 2, order: 50 }),
  makeIngredient({ id: 'rucula', name: 'Rúcula', category: 'vegetal', price: 2, order: 50 }),
  makeIngredient({ id: 'champignon', name: 'Champignon', category: 'vegetal', price: 4, order: 50 }),

  // === EXTRAS ===
  makeIngredient({ id: 'bacon-fatia', name: 'Bacon (Fatias)', category: 'extra', price: 5, order: 60 }),
  makeIngredient({ id: 'bacon-crispy', name: 'Bacon Crispy', category: 'extra', price: 6, order: 60 }),
  makeIngredient({ id: 'bacon-cubo', name: 'Bacon em Cubos', category: 'extra', price: 5, order: 60 }),
  makeIngredient({ id: 'ovo-frito', name: 'Ovo Frito', category: 'extra', price: 3, order: 60 }),
  makeIngredient({ id: 'ovo-cozido', name: 'Ovo Cozido', category: 'extra', price: 2, order: 60 }),
  makeIngredient({ id: 'doritos', name: 'Doritos', category: 'extra', price: 3, order: 60 }),
  makeIngredient({ id: 'batata-palha', name: 'Batata Palha', category: 'extra', price: 2, order: 60 }),
  makeIngredient({ id: 'aneis-cebola', name: 'Anéis de Cebola', category: 'extra', price: 5, order: 60 }),
  makeIngredient({ id: 'calabresa-fatia', name: 'Calabresa (Fatias)', category: 'extra', price: 4, order: 60 }),
  makeIngredient({ id: 'presunto', name: 'Presunto', category: 'extra', price: 4, order: 60 }),
  makeIngredient({ id: 'salame', name: 'Salame', category: 'extra', price: 5, order: 60 }),

  // === ESPECIAIS ===
  makeIngredient({ id: 'abacaxi', name: 'Abacaxi', category: 'especial', price: 3, order: 70 }),
  makeIngredient({ id: 'creme-doritos', name: 'Creme de Doritos', category: 'especial', price: 4, order: 70 }),
  makeIngredient({ id: 'catupiry-empanado', name: 'Catupiry Empanado', category: 'especial', price: 5, order: 70 }),
];

// Função para obter ingredientes por categoria
export function getIngredientesPorCategoria(categoria: Ingredient['category']) {
  return ingredients.filter(ing => ing.category === categoria);
}

// Função para obter um ingrediente por ID
export function getIngredientePorId(id: string) {
  return ingredients.find(ing => ing.id === id);
}

// Função para calcular preço total de uma lista de ingredientes
export function calcularPrecoTotal(ingredientesIds: string[]) {
  return ingredientesIds.reduce((total, id) => {
    const ing = getIngredientePorId(id);
    return total + (ing?.price || 0);
  }, 0);
}
