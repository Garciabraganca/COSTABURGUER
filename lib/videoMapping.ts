// Mapeamento de ingredientes para vídeos do Kitchen Theater
// Cada ingrediente do pedido corresponde a um ou mais clipes de vídeo

export interface VideoClip {
  id: string;
  src: string;
  duration: number; // em segundos
  label: string;
}

export interface VideoSequence {
  intro: VideoClip[];
  ingredientes: VideoClip[];
  montagem: VideoClip[];
  finalizacao: VideoClip[];
  extras: VideoClip[];
}

// Vídeos de introdução (sempre tocam primeiro)
export const introVideos: VideoClip[] = [
  {
    id: 'intro-preparacao',
    src: '/videos/intro/chef-preparando.mp4',
    duration: 5,
    label: 'Preparando sua experiência...',
  },
];

// Mapeamento: ID do ingrediente → clipe de vídeo
export const ingredientVideoMap: Record<string, VideoClip> = {
  // Pães
  'pao-brioche': {
    id: 'pao-brioche',
    src: '/videos/ingredientes/pegando-pao-brioche.mp4',
    duration: 3,
    label: 'Selecionando pão brioche artesanal',
  },
  'pao-australiano': {
    id: 'pao-australiano',
    src: '/videos/ingredientes/pegando-pao-australiano.mp4',
    duration: 3,
    label: 'Selecionando pão australiano',
  },
  'pao-integral': {
    id: 'pao-integral',
    src: '/videos/ingredientes/pegando-pao-integral.mp4',
    duration: 3,
    label: 'Selecionando pão integral',
  },

  // Carnes
  'carne-picanha': {
    id: 'carne-picanha',
    src: '/videos/ingredientes/pegando-carne-picanha.mp4',
    duration: 4,
    label: 'Hambúrguer de picanha selecionado',
  },
  'carne-angus': {
    id: 'carne-angus',
    src: '/videos/ingredientes/pegando-carne-angus.mp4',
    duration: 4,
    label: 'Blend angus premium',
  },
  'carne-frango': {
    id: 'carne-frango',
    src: '/videos/ingredientes/pegando-carne-frango.mp4',
    duration: 4,
    label: 'Filé de frango grelhado',
  },

  // Queijos
  'queijo-cheddar': {
    id: 'queijo-cheddar',
    src: '/videos/ingredientes/pegando-queijo-cheddar.mp4',
    duration: 2,
    label: 'Cheddar inglês',
  },
  'queijo-prato': {
    id: 'queijo-prato',
    src: '/videos/ingredientes/pegando-queijo-prato.mp4',
    duration: 2,
    label: 'Queijo prato',
  },
  'queijo-gorgonzola': {
    id: 'queijo-gorgonzola',
    src: '/videos/ingredientes/pegando-queijo-gorgonzola.mp4',
    duration: 2,
    label: 'Gorgonzola cremoso',
  },

  // Vegetais
  alface: {
    id: 'alface',
    src: '/videos/ingredientes/pegando-alface.mp4',
    duration: 2,
    label: 'Alface americana fresca',
  },
  tomate: {
    id: 'tomate',
    src: '/videos/ingredientes/pegando-tomate.mp4',
    duration: 2,
    label: 'Tomate fatiado',
  },
  cebola: {
    id: 'cebola',
    src: '/videos/ingredientes/pegando-cebola.mp4',
    duration: 2,
    label: 'Cebola roxa',
  },
  picles: {
    id: 'picles',
    src: '/videos/ingredientes/pegando-picles.mp4',
    duration: 2,
    label: 'Picles crocante',
  },

  // Proteínas extras
  bacon: {
    id: 'bacon',
    src: '/videos/ingredientes/pegando-bacon.mp4',
    duration: 3,
    label: 'Bacon artesanal',
  },
  ovo: {
    id: 'ovo',
    src: '/videos/ingredientes/pegando-ovo.mp4',
    duration: 2,
    label: 'Ovo caipira',
  },

  // Molhos
  'molho-especial': {
    id: 'molho-especial',
    src: '/videos/ingredientes/pegando-molho-especial.mp4',
    duration: 2,
    label: 'Molho secreto da casa',
  },
  maionese: {
    id: 'maionese',
    src: '/videos/ingredientes/pegando-maionese.mp4',
    duration: 2,
    label: 'Maionese artesanal',
  },
  ketchup: {
    id: 'ketchup',
    src: '/videos/ingredientes/pegando-ketchup.mp4',
    duration: 2,
    label: 'Ketchup',
  },
  mostarda: {
    id: 'mostarda',
    src: '/videos/ingredientes/pegando-mostarda.mp4',
    duration: 2,
    label: 'Mostarda dijon',
  },
  barbecue: {
    id: 'barbecue',
    src: '/videos/ingredientes/pegando-barbecue.mp4',
    duration: 2,
    label: 'Molho barbecue',
  },
};

// Vídeos de montagem (grelhando, derretendo queijo, etc)
export const montagemVideos: Record<string, VideoClip> = {
  'grelhar-carne': {
    id: 'grelhar-carne',
    src: '/videos/montagem/grelhando-carne.mp4',
    duration: 8,
    label: 'Grelhando no ponto perfeito...',
  },
  'derreter-queijo': {
    id: 'derreter-queijo',
    src: '/videos/montagem/derretendo-queijo.mp4',
    duration: 5,
    label: 'Derretendo o queijo...',
  },
  'fritar-bacon': {
    id: 'fritar-bacon',
    src: '/videos/montagem/fritando-bacon.mp4',
    duration: 6,
    label: 'Bacon crocante na chapa...',
  },
  'fritar-ovo': {
    id: 'fritar-ovo',
    src: '/videos/montagem/fritando-ovo.mp4',
    duration: 5,
    label: 'Fritando o ovo...',
  },
  'montar-burger': {
    id: 'montar-burger',
    src: '/videos/montagem/montando-burger.mp4',
    duration: 10,
    label: 'Montando seu burger...',
  },
};

// Vídeos de finalização
export const finalizacaoVideos: VideoClip[] = [
  {
    id: 'fechar-burger',
    src: '/videos/finalizacao/fechando-burger.mp4',
    duration: 4,
    label: 'Finalizando...',
  },
  {
    id: 'embalar',
    src: '/videos/finalizacao/embalando.mp4',
    duration: 5,
    label: 'Embalando com carinho...',
  },
  {
    id: 'pronto',
    src: '/videos/finalizacao/pronto-entrega.mp4',
    duration: 3,
    label: 'Pronto para você!',
  },
];

// Vídeos de extras (batata, bebida, sobremesa)
export const extrasVideoMap: Record<string, VideoClip> = {
  batata: {
    id: 'batata',
    src: '/videos/extras/fritando-batata.mp4',
    duration: 6,
    label: 'Batatas fritas crocantes...',
  },
  'refri-lata': {
    id: 'refri-lata',
    src: '/videos/extras/servindo-refri-lata.mp4',
    duration: 3,
    label: 'Refrigerante gelado',
  },
  'refri-1l': {
    id: 'refri-1l',
    src: '/videos/extras/servindo-refri-1l.mp4',
    duration: 3,
    label: 'Refrigerante 1L',
  },
  sobremesa: {
    id: 'sobremesa',
    src: '/videos/extras/preparando-sobremesa.mp4',
    duration: 4,
    label: 'Sobremesa especial',
  },
};

// Função principal: gera a sequência de vídeos baseada no pedido
export function generateVideoSequence(
  ingredientes: string[],
  extras: string[] = []
): VideoSequence {
  const sequence: VideoSequence = {
    intro: [...introVideos],
    ingredientes: [],
    montagem: [],
    finalizacao: [...finalizacaoVideos],
    extras: [],
  };

  // Flags para saber quais vídeos de montagem incluir
  let hasQueijo = false;
  let hasBacon = false;
  let hasOvo = false;
  let hasCarne = false;

  // Adiciona vídeos dos ingredientes selecionados
  ingredientes.forEach((ingredienteId) => {
    const video = ingredientVideoMap[ingredienteId];
    if (video) {
      sequence.ingredientes.push(video);

      // Marca flags para montagem
      if (ingredienteId.includes('queijo')) hasQueijo = true;
      if (ingredienteId === 'bacon') hasBacon = true;
      if (ingredienteId === 'ovo') hasOvo = true;
      if (ingredienteId.includes('carne')) hasCarne = true;
    }
  });

  // Adiciona vídeos de montagem baseado nos ingredientes
  if (hasCarne) {
    sequence.montagem.push(montagemVideos['grelhar-carne']);
  }
  if (hasBacon) {
    sequence.montagem.push(montagemVideos['fritar-bacon']);
  }
  if (hasOvo) {
    sequence.montagem.push(montagemVideos['fritar-ovo']);
  }
  if (hasQueijo) {
    sequence.montagem.push(montagemVideos['derreter-queijo']);
  }
  sequence.montagem.push(montagemVideos['montar-burger']);

  // Adiciona vídeos dos extras
  extras.forEach((extraId) => {
    const video = extrasVideoMap[extraId];
    if (video) {
      sequence.extras.push(video);
    }
  });

  return sequence;
}

// Calcula duração total da sequência
export function calculateTotalDuration(sequence: VideoSequence): number {
  const allClips = [
    ...sequence.intro,
    ...sequence.ingredientes,
    ...sequence.montagem,
    ...sequence.finalizacao,
    ...sequence.extras,
  ];
  return allClips.reduce((total, clip) => total + clip.duration, 0);
}

// Retorna lista plana de todos os clipes em ordem
export function flattenSequence(sequence: VideoSequence): VideoClip[] {
  return [
    ...sequence.intro,
    ...sequence.ingredientes,
    ...sequence.montagem,
    ...sequence.extras,
    ...sequence.finalizacao,
  ];
}
