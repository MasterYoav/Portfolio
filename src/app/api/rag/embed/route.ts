import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = { text: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const text = (body?.text ?? "").trim();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const token = process.env.HF_TOKEN;
    const model = process.env.HF_EMBED_MODEL; // e.g. sentence-transformers/all-MiniLM-L6-v2
    if (!token || !model) {
      return NextResponse.json(
        { error: "Missing HF_TOKEN or HF_EMBED_MODEL" },
        { status: 500 },
      );
    }

    // ✅ New HF router endpoint (api-inference.* is deprecated)
    const url = `https://router.huggingface.co/hf-inference/models/${encodeURIComponent(
      model,
    )}/pipeline/feature-extraction`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
      }),
    });

    const raw = await r.text();

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: `HF returned non-JSON: ${raw.slice(0, 200)}` },
        { status: 502 },
      );
    }

    if (!r.ok) {
      return NextResponse.json(
        { error: `HF error ${r.status}`, details: data },
        { status: 502 },
      );
    }

    // HF feature-extraction often returns:
    // - number[] OR
    // - number[][] (token embeddings)
    const vec =
      Array.isArray(data) && typeof (data as any)[0] === "number"
        ? (data as number[])
        : Array.isArray(data) && Array.isArray((data as any)[0])
          ? meanPool(data as number[][])
          : null;

    if (!vec) {
      return NextResponse.json(
        { error: "Unexpected HF response shape", sample: data },
        { status: 502 },
      );
    }

    return NextResponse.json({ embedding: vec, dims: vec.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Simple mean pooling for token embeddings
function meanPool(mat: number[][]): number[] {
  const dims = mat[0]?.length ?? 0;
  if (!dims) return [];
  const out = new Array(dims).fill(0);
  for (const row of mat) {
    for (let i = 0; i < dims; i++) out[i] += row[i] ?? 0;
  }
  for (let i = 0; i < dims; i++) out[i] /= mat.length;
  return out;
}
