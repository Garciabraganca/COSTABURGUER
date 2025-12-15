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
      'CEBOLA ROXA.png',
      'CEBOLA RODELA.png',
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
  'blend-bovino-90g': 'blend-bovino-160-gramas',
  'queijo-cheddar': 'molho-chedar',
  'pao': 'pao-brioche',
  'pao-tradicional': 'pao-com-gergelim-ttradicional',
  'pao-gold': 'pao-com-gergelim-gold',
  'molho-costa-especial': 'molho-billy-e-jack',
  bacon: 'bacon-fatiado',
  maionese: 'maionese',
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
