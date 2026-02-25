// src/lib/rag/embed.ts
// Server-side embedding helper (production-safe on Vercel).
// Uses Hugging Face Inference Router (HF Inference provider) feature-extraction endpoint.
//
// Endpoint shape (per HF docs/community):
// https://router.huggingface.co/hf-inference/models/<MODEL>/pipeline/feature-extraction

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env var: ${name}`);
  return v.trim();
}

function l2Normalize(vec: number[]) {
  let s = 0;
  for (const x of vec) s += x * x;
  const n = Math.sqrt(s) || 1;
  return vec.map((x) => x / n);
}

function meanPool(tokenVecs: number[][]) {
  const dim = tokenVecs[0]?.length ?? 0;
  const out = new Array(dim).fill(0);
  for (const t of tokenVecs) {
    for (let i = 0; i < dim; i++) out[i] += t[i] ?? 0;
  }
  for (let i = 0; i < dim; i++) out[i] /= tokenVecs.length || 1;
  return out;
}

export async function embedText(text: string): Promise<number[]> {
  const t = (text ?? "").trim();
  if (!t) throw new Error("embedText: text is empty");

  const hfToken = mustEnv("HF_TOKEN");
  const model = mustEnv("HF_EMBED_MODEL");

  // ✅ Router endpoint (HF Inference provider)
  const url = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(
    model,
  )}/pipeline/feature-extraction`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    // Router expects `inputs` (string or array). Using array is safest.
    body: JSON.stringify({
      inputs: [t],
      options: { wait_for_model: true },
    }),
  });

  const raw = await r.text();
  if (!r.ok) {
    throw new Error(`HF embeddings failed (${r.status}): ${raw.slice(0, 400)}`);
  }

  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`HF embeddings returned non-JSON: ${raw.slice(0, 200)}`);
  }

  // Common shapes from feature-extraction:
  // A) number[][][]  -> batch (len=1) of token vectors
  // B) number[][]    -> token vectors
  // C) number[]      -> already pooled
  let vec: number[] | null = null;

  // A) batch -> take first
  if (
    Array.isArray(json) &&
    Array.isArray(json[0]) &&
    Array.isArray(json[0][0])
  ) {
    const first = json[0];
    if (Array.isArray(first) && typeof first[0]?.[0] === "number") {
      vec = meanPool(first as number[][]);
    }
  }

  // B) token vectors
  if (
    !vec &&
    Array.isArray(json) &&
    Array.isArray(json[0]) &&
    typeof json[0][0] === "number"
  ) {
    vec = meanPool(json as number[][]);
  }

  // C) already pooled vector
  if (!vec && Array.isArray(json) && typeof json[0] === "number") {
    vec = json as number[];
  }

  if (!vec) {
    throw new Error(`HF embeddings unexpected shape: ${raw.slice(0, 300)}`);
  }

  vec = l2Normalize(vec);

  // Your DB / match_chunks expects 384
  if (vec.length !== 384) {
    throw new Error(
      `Embedding dims ${vec.length}, expected 384 (model=${model})`,
    );
  }

  return vec;
}
