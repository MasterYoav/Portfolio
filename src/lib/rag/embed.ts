// src/lib/rag/embed.ts
// Server-side embedding helper.
// Uses Hugging Face Inference "feature-extraction" endpoint (stable).
// Returns a single 384-dim vector.

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

  // HF feature-extraction endpoint
  const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${encodeURIComponent(
    model,
  )}`;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: t,
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

  // Possible shapes:
  // 1) number[]  (already pooled)
  // 2) number[][] (token vectors) -> mean pool
  // 3) number[][][] (batch) -> take first then pool
  let vec: number[] | null = null;

  if (Array.isArray(json) && typeof json[0] === "number") {
    vec = json as number[];
  } else if (
    Array.isArray(json) &&
    Array.isArray(json[0]) &&
    typeof json[0][0] === "number"
  ) {
    vec = meanPool(json as number[][]);
  } else if (
    Array.isArray(json) &&
    Array.isArray(json[0]) &&
    Array.isArray(json[0][0]) &&
    typeof json[0][0][0] === "number"
  ) {
    vec = meanPool((json[0] as number[][]) ?? []);
  }

  if (!vec) {
    throw new Error(`HF embeddings unexpected shape: ${raw.slice(0, 300)}`);
  }

  vec = l2Normalize(vec);

  // Your DB expects 384
  if (vec.length !== 384) {
    throw new Error(
      `Embedding dims ${vec.length}, expected 384 (model=${model})`,
    );
  }

  return vec;
}
