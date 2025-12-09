export const STEPS = [
  { id: 'pao', label: 'Pão', subtitle: 'Escolha a base perfeita.' },
  { id: 'carne', label: 'Carne', subtitle: 'Defina o coração do seu burger.' },
  { id: 'queijo', label: 'Queijos', subtitle: 'Cheddar, muçarela, prato…' },
  { id: 'extras', label: 'Camadas extras', subtitle: 'Bacon, salada, crispy…' },
  { id: 'molhos', label: 'Molhos', subtitle: 'Toque final da casa.' },
];

export const OPTIONS = {
  pao: [
    { id: 'brioche', nome: 'Pão Brioche', desc: 'Macio e levemente adocicado.', preco: 2.5 },
    { id: 'tradicional', nome: 'Pão Tradicional', desc: 'Clássico de hamburgueria.', preco: 0 },
    { id: 'australiano', nome: 'Pão Australiano', desc: 'Intenso, com toque adocicado.', preco: 3 },
  ],
  carne: [
    { id: 'smash80', nome: 'Smash 80g', desc: 'Fino, crosta perfeita.', preco: 9 },
    { id: 'smash120', nome: 'Smash 120g', desc: 'Mais carne, mais sabor.', preco: 12 },
    { id: 'artesanal150', nome: 'Artesanal 150g', desc: 'Burger alto, suculento.', preco: 16 },
  ],
  queijo: [
    { id: 'cheddar', nome: 'Cheddar', desc: 'Clássico do burger.', preco: 3 },
    { id: 'mussarela', nome: 'Muçarela', desc: 'Derrete fácil, sabor suave.', preco: 2.5 },
    { id: 'prato', nome: 'Queijo Prato', desc: 'Equilíbrio perfeito.', preco: 2.5 },
  ],
  extras: [
    { id: 'bacon', nome: 'Bacon Crocante', desc: 'Tira generosa de bacon.', preco: 4 },
    { id: 'cebola', nome: 'Cebola Crispy', desc: 'Textura e sabor.', preco: 3 },
    { id: 'salada', nome: 'Mix de Salada', desc: 'Alface, tomate e cebola.', preco: 2 },
  ],
  molhos: [
    { id: 'maionese-casa', nome: 'Maionese da Casa', desc: 'Receita especial Costa-Burger.', preco: 2 },
    { id: 'barbecue', nome: 'Barbecue', desc: 'Defumado, levemente adocicado.', preco: 2 },
    { id: 'picante', nome: 'Molho Picante', desc: 'Pimenta na medida.', preco: 2 },
  ],
};

export const EXTRAS = [
  { id: 'batata', nome: 'Batata frita', preco: 12 },
  { id: 'refri-lata', nome: 'Refrigerante lata', preco: 6 },
  { id: 'refri-1l', nome: 'Refrigerante 1L', preco: 10 },
  { id: 'sobremesa', nome: 'Sobremesa do dia', preco: 8 },
];
