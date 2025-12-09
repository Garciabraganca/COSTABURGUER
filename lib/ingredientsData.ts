// Mapeamento completo de ingredientes baseado nas imagens do catálogo
// Cada ingrediente tem: id, nome, categoria, preço, cor (para fallback CSS), e imagem

export type Ingredient = {
  id: string;
  nome: string;
  categoria: 'pao' | 'carne' | 'queijo' | 'molho' | 'extra' | 'vegetal' | 'especial';
  preco: number;
  cor: string; // Cor para representação visual
  altura: number; // Altura da camada em pixels
  ordem: number; // Ordem de empilhamento (menor = mais embaixo)
};

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
export const INGREDIENTES: Ingredient[] = [
  // === PÃES (Base e Topo) ===
  { id: 'pao-australiano-base', nome: 'Pão Australiano (Base)', categoria: 'pao', preco: 3, cor: '#8B4513', altura: 25, ordem: 1 },
  { id: 'pao-australiano-topo', nome: 'Pão Australiano (Topo)', categoria: 'pao', preco: 0, cor: '#8B4513', altura: 35, ordem: 100 },
  { id: 'pao-brioche-base', nome: 'Pão Brioche (Base)', categoria: 'pao', preco: 2.5, cor: '#DEB887', altura: 25, ordem: 1 },
  { id: 'pao-brioche-topo', nome: 'Pão Brioche (Topo)', categoria: 'pao', preco: 0, cor: '#DEB887', altura: 35, ordem: 100 },
  { id: 'pao-beterraba-base', nome: 'Pão Beterraba (Base)', categoria: 'pao', preco: 4, cor: '#8B0000', altura: 25, ordem: 1 },
  { id: 'pao-beterraba-topo', nome: 'Pão Beterraba (Topo)', categoria: 'pao', preco: 0, cor: '#8B0000', altura: 35, ordem: 100 },
  { id: 'pao-gergelin-base', nome: 'Pão Gergelim (Base)', categoria: 'pao', preco: 2, cor: '#F5DEB3', altura: 25, ordem: 1 },
  { id: 'pao-gergelin-topo', nome: 'Pão Gergelim (Topo)', categoria: 'pao', preco: 0, cor: '#F5DEB3', altura: 35, ordem: 100 },
  { id: 'pao-gergelin-gold-base', nome: 'Pão Gergelim Gold (Base)', categoria: 'pao', preco: 3.5, cor: '#DAA520', altura: 25, ordem: 1 },
  { id: 'pao-gergelin-gold-topo', nome: 'Pão Gergelim Gold (Topo)', categoria: 'pao', preco: 0, cor: '#DAA520', altura: 35, ordem: 100 },
  { id: 'pao-gergelin-black-base', nome: 'Pão Gergelim Black (Base)', categoria: 'pao', preco: 4, cor: '#2C2C2C', altura: 25, ordem: 1 },
  { id: 'pao-gergelin-black-topo', nome: 'Pão Gergelim Black (Topo)', categoria: 'pao', preco: 0, cor: '#2C2C2C', altura: 35, ordem: 100 },

  // === CARNES ===
  { id: 'smash-70g', nome: 'Smash 70g', categoria: 'carne', preco: 8, cor: '#5D4037', altura: 15, ordem: 20 },
  { id: 'smash-90g', nome: 'Smash 90g', categoria: 'carne', preco: 10, cor: '#5D4037', altura: 18, ordem: 20 },
  { id: 'smash-120g', nome: 'Smash 120g', categoria: 'carne', preco: 12, cor: '#5D4037', altura: 22, ordem: 20 },
  { id: 'blend-bovino-90', nome: 'Blend Bovino 90g', categoria: 'carne', preco: 11, cor: '#6D4C41', altura: 20, ordem: 20 },
  { id: 'blend-bovino-120', nome: 'Blend Bovino 120g', categoria: 'carne', preco: 14, cor: '#6D4C41', altura: 24, ordem: 20 },
  { id: 'blend-bovino-160', nome: 'Blend Bovino 160g', categoria: 'carne', preco: 18, cor: '#6D4C41', altura: 28, ordem: 20 },
  { id: 'blend-bovino-200', nome: 'Blend Bovino 200g', categoria: 'carne', preco: 22, cor: '#6D4C41', altura: 32, ordem: 20 },
  { id: 'blend-frango', nome: 'Blend de Frango', categoria: 'carne', preco: 12, cor: '#D4A574', altura: 20, ordem: 20 },
  { id: 'blend-vegetariano', nome: 'Blend Vegetariano', categoria: 'carne', preco: 14, cor: '#8D6E63', altura: 20, ordem: 20 },
  { id: 'frango-empanado', nome: 'Frango Empanado', categoria: 'carne', preco: 15, cor: '#DEB887', altura: 25, ordem: 20 },
  { id: 'costela-desfiada', nome: 'Costela Desfiada', categoria: 'carne', preco: 20, cor: '#8B4513', altura: 22, ordem: 20 },
  { id: 'carne-desfiada', nome: 'Carne Desfiada', categoria: 'carne', preco: 16, cor: '#A0522D', altura: 20, ordem: 20 },

  // === QUEIJOS ===
  { id: 'cheddar-fatia', nome: 'Cheddar (Fatia)', categoria: 'queijo', preco: 3, cor: '#FF8C00', altura: 8, ordem: 30 },
  { id: 'cheddar-cremoso', nome: 'Cheddar Cremoso', categoria: 'queijo', preco: 4, cor: '#FFA500', altura: 10, ordem: 30 },
  { id: 'mussarela-fatia', nome: 'Mussarela (Fatia)', categoria: 'queijo', preco: 2.5, cor: '#FFFACD', altura: 8, ordem: 30 },
  { id: 'mussarela-ralada', nome: 'Mussarela Ralada', categoria: 'queijo', preco: 3, cor: '#FFF8DC', altura: 12, ordem: 30 },
  { id: 'prato-fatia', nome: 'Queijo Prato (Fatia)', categoria: 'queijo', preco: 2.5, cor: '#F0E68C', altura: 8, ordem: 30 },
  { id: 'provolone', nome: 'Provolone', categoria: 'queijo', preco: 4, cor: '#FAFAD2', altura: 8, ordem: 30 },
  { id: 'cream-cheese', nome: 'Cream Cheese', categoria: 'queijo', preco: 4.5, cor: '#FFFAF0', altura: 10, ordem: 30 },
  { id: 'catupiry', nome: 'Catupiry', categoria: 'queijo', preco: 4, cor: '#FFF5EE', altura: 10, ordem: 30 },
  { id: 'queijo-coalho', nome: 'Queijo Coalho', categoria: 'queijo', preco: 5, cor: '#F5DEB3', altura: 12, ordem: 30 },
  { id: 'gorgonzola', nome: 'Gorgonzola', categoria: 'queijo', preco: 6, cor: '#E8E8D0', altura: 10, ordem: 30 },

  // === MOLHOS ===
  { id: 'ketchup', nome: 'Ketchup', categoria: 'molho', preco: 0, cor: '#DC143C', altura: 6, ordem: 40 },
  { id: 'mostarda', nome: 'Mostarda', categoria: 'molho', preco: 0, cor: '#FFD700', altura: 6, ordem: 40 },
  { id: 'maionese', nome: 'Maionese', categoria: 'molho', preco: 0, cor: '#FFF8DC', altura: 6, ordem: 40 },
  { id: 'barbecue', nome: 'Barbecue', categoria: 'molho', preco: 2, cor: '#8B0000', altura: 6, ordem: 40 },
  { id: 'molho-verde', nome: 'Molho Verde', categoria: 'molho', preco: 2, cor: '#228B22', altura: 6, ordem: 40 },
  { id: 'molho-rose', nome: 'Molho Rosé', categoria: 'molho', preco: 2, cor: '#FFB6C1', altura: 6, ordem: 40 },
  { id: 'molho-especial', nome: 'Molho Especial', categoria: 'molho', preco: 3, cor: '#CD853F', altura: 6, ordem: 40 },
  { id: 'billy-jack', nome: 'Billy & Jack', categoria: 'molho', preco: 3, cor: '#DEB887', altura: 6, ordem: 40 },
  { id: 'molho-shoyu', nome: 'Molho Shoyu', categoria: 'molho', preco: 2, cor: '#4A3728', altura: 6, ordem: 40 },
  { id: 'geleia-pimenta', nome: 'Geléia de Pimenta', categoria: 'molho', preco: 4, cor: '#B22222', altura: 6, ordem: 40 },

  // === VEGETAIS ===
  { id: 'alface', nome: 'Alface', categoria: 'vegetal', preco: 1, cor: '#90EE90', altura: 12, ordem: 50 },
  { id: 'tomate', nome: 'Tomate', categoria: 'vegetal', preco: 1, cor: '#FF6347', altura: 10, ordem: 50 },
  { id: 'cebola-rodela', nome: 'Cebola (Rodelas)', categoria: 'vegetal', preco: 1, cor: '#E6E6FA', altura: 8, ordem: 50 },
  { id: 'cebola-roxa', nome: 'Cebola Roxa', categoria: 'vegetal', preco: 1.5, cor: '#9370DB', altura: 8, ordem: 50 },
  { id: 'cebola-caramelizada', nome: 'Cebola Caramelizada', categoria: 'vegetal', preco: 3, cor: '#8B4513', altura: 10, ordem: 50 },
  { id: 'picles', nome: 'Picles', categoria: 'vegetal', preco: 2, cor: '#9ACD32', altura: 8, ordem: 50 },
  { id: 'rucula', nome: 'Rúcula', categoria: 'vegetal', preco: 2, cor: '#2E8B57', altura: 12, ordem: 50 },
  { id: 'champignon', nome: 'Champignon', categoria: 'vegetal', preco: 4, cor: '#F5F5DC', altura: 10, ordem: 50 },

  // === EXTRAS ===
  { id: 'bacon-fatia', nome: 'Bacon (Fatias)', categoria: 'extra', preco: 5, cor: '#CD5C5C', altura: 10, ordem: 60 },
  { id: 'bacon-crispy', nome: 'Bacon Crispy', categoria: 'extra', preco: 6, cor: '#A52A2A', altura: 12, ordem: 60 },
  { id: 'bacon-cubo', nome: 'Bacon em Cubos', categoria: 'extra', preco: 5, cor: '#B22222', altura: 10, ordem: 60 },
  { id: 'ovo-frito', nome: 'Ovo Frito', categoria: 'extra', preco: 3, cor: '#FFD700', altura: 15, ordem: 60 },
  { id: 'ovo-cozido', nome: 'Ovo Cozido', categoria: 'extra', preco: 2, cor: '#FFFACD', altura: 12, ordem: 60 },
  { id: 'doritos', nome: 'Doritos', categoria: 'extra', preco: 3, cor: '#FF4500', altura: 10, ordem: 60 },
  { id: 'batata-palha', nome: 'Batata Palha', categoria: 'extra', preco: 2, cor: '#DAA520', altura: 10, ordem: 60 },
  { id: 'aneis-cebola', nome: 'Anéis de Cebola', categoria: 'extra', preco: 5, cor: '#DEB887', altura: 15, ordem: 60 },
  { id: 'calabresa-fatia', nome: 'Calabresa (Fatias)', categoria: 'extra', preco: 4, cor: '#CD5C5C', altura: 10, ordem: 60 },
  { id: 'presunto', nome: 'Presunto', categoria: 'extra', preco: 4, cor: '#FFB6C1', altura: 8, ordem: 60 },
  { id: 'salame', nome: 'Salame', categoria: 'extra', preco: 5, cor: '#8B0000', altura: 8, ordem: 60 },

  // === ESPECIAIS ===
  { id: 'abacaxi', nome: 'Abacaxi', categoria: 'especial', preco: 3, cor: '#FFD700', altura: 10, ordem: 70 },
  { id: 'creme-doritos', nome: 'Creme de Doritos', categoria: 'especial', preco: 4, cor: '#FF6347', altura: 10, ordem: 70 },
  { id: 'catupiry-empanado', nome: 'Catupiry Empanado', categoria: 'especial', preco: 5, cor: '#FFF8DC', altura: 15, ordem: 70 },
];

// Função para obter ingredientes por categoria
export function getIngredientesPorCategoria(categoria: Ingredient['categoria']) {
  return INGREDIENTES.filter(ing => ing.categoria === categoria);
}

// Função para obter um ingrediente por ID
export function getIngredientePorId(id: string) {
  return INGREDIENTES.find(ing => ing.id === id);
}

// Função para calcular preço total de uma lista de ingredientes
export function calcularPrecoTotal(ingredientesIds: string[]) {
  return ingredientesIds.reduce((total, id) => {
    const ing = getIngredientePorId(id);
    return total + (ing?.preco || 0);
  }, 0);
}
