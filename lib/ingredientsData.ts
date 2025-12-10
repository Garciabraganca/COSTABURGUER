// Mapeamento de ingredientes utilizando imagens individuais

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
  image: string;
  order: number;
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

// Imagem base do hamburguer girando
export const HAMBURGER_BASE_IMAGE = '/ingredients/carnes/hamburguer.png';

// Ingredientes com imagens individuais
export const ingredients: Ingredient[] = [
  // === PÃES ===
  { id: 'pao-australiano', name: 'Pão Australiano', category: 'pao', price: 3, order: 1, image: '/ingredients/paes/PÃO AUSTRALIANO.png' },
  { id: 'pao-brioche', name: 'Pão Brioche', category: 'pao', price: 2.5, order: 1, image: '/ingredients/paes/PÃO BRIOCHE.png' },
  { id: 'pao-beterraba', name: 'Pão de Beterraba', category: 'pao', price: 4, order: 1, image: '/ingredients/paes/PÃO  DE BETERRABA.png' },
  { id: 'pao-gergelim-gold', name: 'Pão Gergelim Gold', category: 'pao', price: 3.5, order: 1, image: '/ingredients/paes/PÃO COM GERGELIM GOLD.png' },
  { id: 'pao-gergelim', name: 'Pão Gergelim Tradicional', category: 'pao', price: 2, order: 1, image: '/ingredients/paes/PÃO COM GERGELIM TTRADICIONAL.png' },

  // === CARNES ===
  { id: 'blend-bovino-90-120', name: 'Blend Bovino 90/120g', category: 'carne', price: 12, order: 20, image: '/ingredients/carnes/1.png' },
  { id: 'blend-bovino-160', name: 'Blend Bovino 160g', category: 'carne', price: 18, order: 20, image: '/ingredients/carnes/BLEND BOVINO 160 GRAMAS.png' },
  { id: 'blend-frango', name: 'Blend de Frango', category: 'carne', price: 12, order: 20, image: '/ingredients/carnes/BLAND DE FRANGO.png' },
  { id: 'hamburguer-simples', name: 'Hambúrguer Simples', category: 'carne', price: 10, order: 20, image: '/ingredients/carnes/HAMBURGUER SIMPLES.png' },
  { id: 'costela', name: 'Costela Desfiada', category: 'carne', price: 20, order: 20, image: '/ingredients/carnes/COSTELA.png' },
  { id: 'carne-desfiada', name: 'Carne Desfiada', category: 'carne', price: 16, order: 20, image: '/ingredients/carnes/CARNE DESFIADA.png' },
  { id: 'frango-desfiado', name: 'Frango Desfiado', category: 'carne', price: 14, order: 20, image: '/ingredients/carnes/FRANGO DESFIADO.png' },
  { id: 'frango-cubo', name: 'Frango em Cubos', category: 'carne', price: 14, order: 20, image: '/ingredients/carnes/FRANGO EM CUBO.png' },
  { id: 'atum', name: 'Atum', category: 'carne', price: 18, order: 20, image: '/ingredients/carnes/ATUM.png' },
  { id: 'camaroes', name: 'Camarões', category: 'carne', price: 25, order: 20, image: '/ingredients/carnes/CAMARÕES.png' },
  { id: 'tofu', name: 'Tofu', category: 'carne', price: 12, order: 20, image: '/ingredients/carnes/TOFU.png' },

  // === QUEIJOS ===
  { id: 'mussarela-fatiada', name: 'Mussarela Fatiada', category: 'queijo', price: 3, order: 30, image: '/ingredients/queijos/MUSSARELA FATIADA.png' },
  { id: 'mussarela-ralada', name: 'Mussarela Ralada', category: 'queijo', price: 3, order: 30, image: '/ingredients/queijos/MUSSARELA RALADA.png' },
  { id: 'queijo-mussarela', name: 'Queijo Mussarela', category: 'queijo', price: 3, order: 30, image: '/ingredients/queijos/QUEIJO MUSSARELA.png' },
  { id: 'queijo-prato', name: 'Queijo Prato', category: 'queijo', price: 2.5, order: 30, image: '/ingredients/queijos/QUEIJO PRATO.png' },
  { id: 'gorgonzola', name: 'Gorgonzola', category: 'queijo', price: 6, order: 30, image: '/ingredients/queijos/QUEIJO GORGONZOLA.png' },
  { id: 'cream-cheese', name: 'Cream Cheese', category: 'queijo', price: 4.5, order: 30, image: '/ingredients/queijos/CREAM CHEESE.png' },
  { id: 'catupiry', name: 'Catupiry', category: 'queijo', price: 4, order: 30, image: '/ingredients/queijos/CATUPIRY.png' },
  { id: 'cheddar', name: 'Cheddar', category: 'queijo', price: 4, order: 30, image: '/ingredients/queijos/MOLHO CHEDAR.png' },
  { id: 'parmesao', name: 'Parmesão Ralado', category: 'queijo', price: 5, order: 30, image: '/ingredients/queijos/PARMESAO RALADO.png' },

  // === MOLHOS ===
  { id: 'ketchup', name: 'Ketchup', category: 'molho', price: 0, order: 40, image: '/ingredients/molhos/CATCHUP.png' },
  { id: 'mostarda', name: 'Mostarda', category: 'molho', price: 0, order: 40, image: '/ingredients/molhos/MOSTARDA.png' },
  { id: 'maionese', name: 'Maionese', category: 'molho', price: 0, order: 40, image: '/ingredients/molhos/MAIONESE.png' },
  { id: 'barbecue', name: 'Barbecue', category: 'molho', price: 2, order: 40, image: '/ingredients/molhos/MOLHO BARBECUE.png' },
  { id: 'molho-verde', name: 'Molho Verde', category: 'molho', price: 2, order: 40, image: '/ingredients/molhos/MOLHO VERDE.png' },
  { id: 'billy-jack', name: 'Billy & Jack', category: 'molho', price: 3, order: 40, image: '/ingredients/molhos/MOLHO BILLY E JACK.png' },
  { id: 'molho-shoyu', name: 'Molho Shoyu', category: 'molho', price: 2, order: 40, image: '/ingredients/molhos/MOLHO SHOYU.png' },
  { id: 'geleia-pimenta', name: 'Geléia de Pimenta', category: 'molho', price: 4, order: 40, image: '/ingredients/molhos/GELEIA DE PIMENTA.png' },

  // === VEGETAIS ===
  { id: 'alface', name: 'Alface', category: 'vegetal', price: 1, order: 50, image: '/ingredients/vegetais/ALFACE.png' },
  { id: 'tomate', name: 'Tomate', category: 'vegetal', price: 1, order: 50, image: '/ingredients/vegetais/TOMATE.png' },
  { id: 'cebola', name: 'Cebola', category: 'vegetal', price: 1, order: 50, image: '/ingredients/vegetais/CEBOLA.png' },
  { id: 'cebola-branca', name: 'Cebola Branca', category: 'vegetal', price: 1, order: 50, image: '/ingredients/vegetais/CEBOLA BRANCA.png' },
  { id: 'cebola-roxa', name: 'Cebola Roxa', category: 'vegetal', price: 1.5, order: 50, image: '/ingredients/vegetais/CEBOLA ROXA.png' },
  { id: 'cebola-rodela', name: 'Cebola em Rodelas', category: 'vegetal', price: 1, order: 50, image: '/ingredients/vegetais/CEBOLA RODELA.png' },
  { id: 'cebola-caramelizada', name: 'Cebola Caramelizada', category: 'vegetal', price: 3, order: 50, image: '/ingredients/vegetais/CEBOLA CARAMELIZADA.png' },
  { id: 'cebola-crispy', name: 'Cebola Crispy', category: 'vegetal', price: 3, order: 50, image: '/ingredients/vegetais/CEBOLA CRISPY.png' },
  { id: 'picles', name: 'Picles', category: 'vegetal', price: 2, order: 50, image: '/ingredients/vegetais/PICLES.png' },
  { id: 'azeitona', name: 'Azeitona', category: 'vegetal', price: 2, order: 50, image: '/ingredients/vegetais/AZEITONA.png' },
  { id: 'ervilha', name: 'Ervilha', category: 'vegetal', price: 2, order: 50, image: '/ingredients/vegetais/ERVILHA.png' },
  { id: 'milho', name: 'Milho', category: 'vegetal', price: 2, order: 50, image: '/ingredients/vegetais/MILHO.png' },

  // === EXTRAS ===
  { id: 'bacon-fatiado', name: 'Bacon Fatiado', category: 'extra', price: 5, order: 60, image: '/ingredients/extras/BACON FATIADO.png' },
  { id: 'bacon-crispy', name: 'Bacon Crispy', category: 'extra', price: 6, order: 60, image: '/ingredients/extras/BACON CRISPY.png' },
  { id: 'bacon-cubo', name: 'Bacon em Cubos', category: 'extra', price: 5, order: 60, image: '/ingredients/extras/BACON CUBO.png' },
  { id: 'bacon-tiras', name: 'Bacon em Tiras', category: 'extra', price: 5, order: 60, image: '/ingredients/extras/BACON TIRAS.png' },
  { id: 'ovo-frito', name: 'Ovo Frito', category: 'extra', price: 3, order: 60, image: '/ingredients/extras/OVO FRITO.png' },
  { id: 'doritos', name: 'Doritos', category: 'extra', price: 3, order: 60, image: '/ingredients/extras/DORITOS.png' },
  { id: 'batata-palha', name: 'Batata Palha', category: 'extra', price: 2, order: 60, image: '/ingredients/extras/BATATA PALHA.png' },
  { id: 'aneis-cebola', name: 'Anéis de Cebola', category: 'extra', price: 5, order: 60, image: '/ingredients/extras/ANEIS DE CEBOLA.png' },
  { id: 'calabresa', name: 'Calabresa Fatiada', category: 'extra', price: 4, order: 60, image: '/ingredients/extras/CALABRESA FATIADA.png' },
  { id: 'salame', name: 'Salame', category: 'extra', price: 5, order: 60, image: '/ingredients/extras/SALAME.png' },

  // === ESPECIAIS ===
  { id: 'passas', name: 'Passas', category: 'especial', price: 2, order: 70, image: '/ingredients/extras/PASSAS.png' },
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
