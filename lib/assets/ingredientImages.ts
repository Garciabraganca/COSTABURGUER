const DIRS = {
  paes: {
    basePath: '/ingredients/paes',
    files: [
      'PÃO  DE BETERRABA.png',
      'PÃO AUSTRALIANO.png',
      'PÃO BRIOCHE.png',
      'PÃO COM GERGELIM GOLD.png',
      'PÃO COM GERGELIM TTRADICIONAL.png',
    ],
  },
  carnes: {
    basePath: '/ingredients/carnes',
    files: [
      '1.png',
      '2.png',
      '3.png',
      '4.png',
      '5.png',
      '6.png',
      '7.png',
      '8.png',
      '9.png',
      '10.png',
      '11.png',
      'ATUM.png',
      'BLAND DE FRANGO.png',
      'BLEND BOVINO 160 GRAMAS.png',
      'CAMARÕES.png',
      'CARNE DESFIADA.png',
      'COSTELA.png',
      'FRANGO DESFIADO.png',
      'FRANGO EM CUBO.png',
      'HAMBURGUER SIMPLES.png',
      'TOFU.png',
      'hamburguer.png',
    ],
  },
  queijos: {
    basePath: '/ingredients/queijos',
    files: [
      'CATUPIRY.png',
      'CREAM CHEESE.png',
      'MOLHO CHEDAR.png',
      'MUSSARELA FATIADA.png',
      'MUSSARELA RALADA.png',
      'PARMESAO RALADO.png',
      'QUEIJO GORGONZOLA.png',
      'QUEIJO MUSSARELA.png',
      'QUEIJO PRATO.png',
    ],
  },
  molhos: {
    basePath: '/ingredients/molhos',
    files: [
      'CATCHUP (2).png',
      'CATCHUP.png',
      'GELEIA DE PIMENTA.png',
      'MAIONESE.png',
      'MOLHO BARBECUE (2).png',
      'MOLHO BARBECUE.png',
      'MOLHO BILLY E JACK.png',
      'MOLHO SHOYU.png',
      'MOLHO VERDE.png',
      'MOSTARDA.png',
    ],
  },
  vegetais: {
    basePath: '/ingredients/vegetais',
    files: [
      'ALFACE.png',
      'AZEITONA.png',
      'CEBOLA BRANCA.png',
      'CEBOLA CARAMELIZADA.png',
      'CEBOLA CRISPY.png',
      'CEBOLA RODELA.png',
      'CEBOLA ROXA.png',
      'CEBOLA.png',
      'ERVILHA.png',
      'MILHO.png',
      'PICLES.png',
      'TOMATE.png',
    ],
  },
  extras: {
    basePath: '/ingredients/extras',
    files: [
      'ANEIS DE CEBOLA.png',
      'BACON CRISPY.png',
      'BACON CUBO.png',
      'BACON FATIADO.png',
      'BACON TIRAS.png',
      'BATATA PALHA.png',
      'CALABRESA FATIADA.png',
      'DORITOS.png',
      'OVO FRITO.png',
      'PASSAS.png',
      'SALAME.png',
    ],
  },
};

function slugify(input: string) {
  return input
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .toLowerCase();
}

const aliases: Record<string, string> = {
  // Aliases para pães
  'pao': 'pao-brioche',
  'pao-tradicional': 'pao-com-gergelim-ttradicional',
  'pao-gergelim': 'pao-com-gergelim-ttradicional',
  'pao-gold': 'pao-com-gergelim-gold',
  'pao-gergelim-gold': 'pao-com-gergelim-gold',
  'pao-beterraba': 'pao-de-beterraba',

  // Aliases para carnes
  'blend-bovino-90g': 'blend-bovino-160-gramas',
  'blend-bovino-90': 'blend-bovino-160-gramas',
  'blend-bovino-120': 'blend-bovino-160-gramas',
  'blend-bovino-90-120': 'blend-bovino-160-gramas',
  'blend-bovino-160': 'blend-bovino-160-gramas',
  'blend-bovino': 'blend-bovino-160-gramas',
  'hamburguer': 'hamburguer-simples',
  'carne': 'blend-bovino-160-gramas',
  'frango': 'frango-desfiado',
  'blend-frango': 'bland-de-frango',
  'bland-de-frango': 'bland-de-frango',
  'frango-cubo': 'frango-em-cubo',
  'frango-em-cubo': 'frango-em-cubo',
  'carne-desfiada': 'carne-desfiada',

  // Aliases para queijos
  'queijo-cheddar': 'molho-chedar',
  'cheddar': 'molho-chedar',
  'queijo-mussarela': 'mussarela-fatiada',
  'mussarela': 'mussarela-fatiada',
  'queijo': 'queijo-prato',
  'cream-cheese': 'cream-cheese',
  'gorgonzola': 'queijo-gorgonzola',
  'parmesao': 'parmesao-ralado',

  // Aliases para molhos
  'maionese': 'maionese',
  'barbecue': 'molho-barbecue',
  'molho-costa-especial': 'molho-billy-e-jack',
  'billy-jack': 'molho-billy-e-jack',
  'ketchup': 'catchup',
  'shoyu': 'molho-shoyu',
  'geleia-pimenta': 'geleia-de-pimenta',

  // Aliases para vegetais
  'cebola': 'cebola',
  'cebola-branca': 'cebola-branca',
  'cebola-caramelizada': 'cebola-caramelizada',
  'cebola-crispy': 'cebola-crispy',
  'cebola-rodela': 'cebola-rodela',

  // Aliases para extras
  'bacon': 'bacon-fatiado',
  'bacon-tiras': 'bacon-tiras',
  'bacon-cubo': 'bacon-cubo',
  'aneis-cebola': 'aneis-de-cebola',
  'calabresa': 'calabresa-fatiada',
  'ovo': 'ovo-frito',

  // Aliases para categoria especial - usa imagem de molho especial
  'especial': 'molho-billy-e-jack',
  'passas': 'passas',
};

function buildManifest() {
  const manifest: Record<string, string> = {};

  Object.values(DIRS).forEach(({ basePath, files }) => {
    files.forEach((file) => {
      const baseName = file.replace(/\.[^.]+$/, '');
      const slug = slugify(baseName);
      const encodedPath = `${basePath}/${encodeURIComponent(file.trim())}`;

      if (!manifest[slug]) {
        manifest[slug] = encodedPath;
      }
    });
  });

  Object.entries(aliases).forEach(([slug, target]) => {
    if (manifest[target]) {
      manifest[slug] = manifest[target];
    }
  });

  return manifest;
}

export const INGREDIENT_IMAGE_MANIFEST = buildManifest();

const warnedSlugs = new Set<string>();

export function getIngredientImage(slug?: string | null) {
  if (!slug) return null;
  const normalized = slug.toLowerCase();
  const found = INGREDIENT_IMAGE_MANIFEST[normalized];

  if (found) return found;

  if (!warnedSlugs.has(normalized)) {
    console.warn(`[ingredientImages] Imagem não encontrada para slug: ${normalized}`);
    warnedSlugs.add(normalized);
  }

  return null;
}

export const HAMBURGER_BASE_IMAGE =
  INGREDIENT_IMAGE_MANIFEST['hamburguer'] || '/ingredients/carnes/hamburguer.png';

export type CatalogCategorySlug =
  | 'pao'
  | 'carne'
  | 'queijo'
  | 'molho'
  | 'vegetais'
  | 'extras'
  | 'especial';
