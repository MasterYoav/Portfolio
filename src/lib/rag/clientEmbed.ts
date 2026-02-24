let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = (async () => {
      const { pipeline } = await import("@xenova/transformers");
      return pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    })();
  }
  return extractorPromise;
}

function meanPool(vectors: number[][]): number[] {
  const dim = vectors[0]?.length ?? 0;
  const out = new Array(dim).fill(0);
  for (const v of vectors) for (let i = 0; i < dim; i++) out[i] += v[i];
  for (let i = 0; i < dim; i++) out[i] /= vectors.length;
  return out;
}

function l2Normalize(vec: number[]): number[] {
  let norm = 0;
  for (const x of vec) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  return vec.map((x) => x / norm);
}

export async function embedQuery(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const out: any = await extractor(text, { pooling: "none", normalize: false });
  const tokens: number[][] = await out.tolist();
  const tokenVecs = Array.isArray(tokens[0]?.[0])
    ? (tokens[0] as number[][])
    : (tokens as number[][]);
  const emb = l2Normalize(meanPool(tokenVecs));
  if (emb.length !== 384)
    throw new Error(`Embedding dim mismatch: ${emb.length}`);
  return emb;
}
