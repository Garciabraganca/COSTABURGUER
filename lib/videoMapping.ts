export type VideoClip = { id: string; slug: string; src: string; duration: number; label: string };

export type VideoSequence = {
  intro: VideoClip[];
  ingredientes: VideoClip[];
  montagem: VideoClip[];
  extras: VideoClip[];
  outro?: VideoClip[];
};

export const videoMapping: Record<string, string> = {
  'pao-brioche': '/videos/pao-brioche.mp4',
  'blend-bovino-90': '/videos/blend-bovino-90.mp4',
  'queijo-cheddar': '/videos/queijo-cheddar.mp4',
};

export function getVideoForIngredient(slug: string): string | null {
  return videoMapping[slug] || null;
}

function createClip(slug: string, label: string, duration = 3): VideoClip {
  return {
    id: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
    slug,
    src: getVideoForIngredient(slug) || '/videos/placeholder.mp4',
    duration,
    label,
  };
}

export function generateVideoSequence(ingredientes: string[], extras: string[] = []): VideoSequence {
  const intro: VideoClip[] = [createClip('intro', 'Preparando a bancada', 2)];
  const ingredienteClips = ingredientes.map((slug) => createClip(slug, `Adicionando ${slug}`));
  const montagem: VideoClip[] = [createClip('montagem', 'Montando o burger', 4)];
  const extrasClips = extras.map((slug) => createClip(slug, `Incluindo extra: ${slug}`));
  const outro: VideoClip[] = [createClip('final', 'Finalizando pedido', 3)];

  return { intro, ingredientes: ingredienteClips, montagem, extras: extrasClips, outro };
}

export function flattenSequence(sequence: VideoSequence): VideoClip[] {
  return [
    ...sequence.intro,
    ...sequence.ingredientes,
    ...sequence.montagem,
    ...sequence.extras,
    ...(sequence.outro ?? []),
  ];
}

export function calculateTotalDuration(sequence: VideoSequence): number {
  return flattenSequence(sequence).reduce((total, clip) => total + clip.duration, 0);
}
