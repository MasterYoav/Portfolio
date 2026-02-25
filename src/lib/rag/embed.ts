// src/lib/rag/embed.ts
// Server-side embedding helper (used by ingest + /api/chat).
// Priority:
// 1) Hugging Face (production-safe)
// 2) Local embeddings server (Ollama) for dev only

type EmbedResponse = {
  embedding: number[];
  dims?: number;
};

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env var: ${name}`);
  return v.trim();
}

function isProbablyLocalhost(url: string) {
  return (
    url.includes("127.0.0.1") ||
    url.includes("localhost") ||
    url.startsWith("http://0.0.0.0")
  );
}

export async function embedText(text: string): Promise<number[]> {
  const t = (text ?? "").trim();
  if (!t) throw new Error("embedText: text is empty");

  // ---- A) Prefer Hugging Face in production ----
  const hfToken = process.env.HF_TOKEN?.trim();
  const hfModel = process.env.HF_EMBED_MODEL?.trim();

  if (hfToken && hfModel) {
    const r = await fetch("https://router.huggingface.co/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: hfModel,
        input: t,
      }),
    });

    const raw = await r.text();

    if (!r.ok) {
      throw new Error(
        `HF embeddings failed (${r.status}): ${raw.slice(0, 400)}`,
      );
    }

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      throw new Error(`HF embeddings returned non-JSON: ${raw.slice(0, 200)}`);
    }

    // HF OpenAI-style:
    // { data: [ { embedding: number[] } ] }
    const emb = json?.data?.[0]?.embedding;
    if (!Array.isArray(emb)) {
      throw new Error(
        `HF embeddings unexpected shape: ${JSON.stringify(json).slice(0, 300)}`,
      );
    }

    return emb as number[];
  }

  // ---- B) Fallback to local embeddings server (dev) ----
  const base = process.env.EMBEDDINGS_BASE_URL?.trim();
  if (!base) {
    throw new Error(
      "Missing embeddings config. Set (HF_TOKEN + HF_EMBED_MODEL) for production, or EMBEDDINGS_BASE_URL for local dev.",
    );
  }

  // IMPORTANT: prevent accidentally calling localhost in production
  // (this is exactly your current crash)
  if (process.env.VERCEL && isProbablyLocalhost(base)) {
    throw new Error(
      `EMBEDDINGS_BASE_URL points to localhost (${base}) on Vercel. Remove it and use HF_TOKEN + HF_EMBED_MODEL instead.`,
    );
  }

  const url = `${base.replace(/\/$/, "")}/embed`;

  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: t }),
  });

  const raw = await r.text();
  if (!r.ok) {
    throw new Error(
      `Local embeddings failed (${r.status}): ${raw.slice(0, 300)}`,
    );
  }

  let json: EmbedResponse | any;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`Local embeddings returned non-JSON: ${raw.slice(0, 200)}`);
  }

  if (!Array.isArray(json.embedding)) {
    throw new Error(
      `Local embeddings unexpected shape: ${JSON.stringify(json).slice(0, 300)}`,
    );
  }

  return json.embedding as number[];
}
