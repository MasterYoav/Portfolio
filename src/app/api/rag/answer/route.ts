import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type Body = {
  question: string;
  match_count?: number;
};

type ChunkRow = {
  id: string;
  document_id: string | null;
  content: string;
  similarity: number | null;
};

function buildPrompt(question: string, chunks: ChunkRow[]) {
  const context = chunks
    .map(
      (c, i) =>
        `[#${i + 1} | sim ${c.similarity?.toFixed?.(3) ?? "?"}]\n${c.content}`,
    )
    .join("\n\n---\n\n");

  return `You are a helpful assistant. You answer ONLY using the provided context about Yoav.
If the context does not contain the answer, say you don't know and suggest what information is missing.
Be concise and factual. No hallucinations.

User question:
${question}

Context:
${context}

Answer:`;
}

async function embedViaInternalRoute(req: Request, text: string) {
  // Call our own working endpoint (/api/rag/embed)
  const url = new URL("/api/rag/embed", req.url);

  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const json = await r.json().catch(() => null);

  if (!r.ok) {
    const err = json?.error || `Embed failed (${r.status})`;
    throw new Error(err);
  }

  const embedding = json?.embedding;
  const dims = json?.dims;

  if (!Array.isArray(embedding)) {
    throw new Error(
      `Embed returned unexpected shape: ${JSON.stringify(json)?.slice?.(0, 220)}`,
    );
  }
  if (embedding.length !== 384) {
    throw new Error(
      `Expected 384 dims, got ${embedding.length} (dims field: ${dims})`,
    );
  }

  return embedding as number[];
}

async function generateAnswer(prompt: string) {
  const HF_TOKEN = process.env.HF_TOKEN;
  const HF_CHAT_MODEL = process.env.HF_CHAT_MODEL; // e.g. "mistralai/Mistral-7B-Instruct-v0.3"
  if (!HF_TOKEN || !HF_CHAT_MODEL) {
    throw new Error("Missing HF_TOKEN or HF_CHAT_MODEL");
  }

  // OpenAI-compatible chat endpoint (HF Router)
  const url = "https://router.huggingface.co/v1/chat/completions";

  const r = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: HF_CHAT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 240,
      stream: false,
    }),
  });

  const json = await r.json().catch(() => null);

  if (!r.ok) {
    const err =
      json?.error?.message || json?.error || `HF chat failed (${r.status})`;
    throw new Error(err);
  }

  const text = json?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error(
      `Unexpected HF chat response shape: ${JSON.stringify(json)?.slice?.(0, 220)}`,
    );
  }

  return text.trim();
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const question = (body?.question ?? "").trim();
    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }

    // 1) embed via our own working route
    const query_embedding = await embedViaInternalRoute(req, question);

    // 2) retrieve
    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Missing Supabase env vars" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const match_count = Math.min(Math.max(body.match_count ?? 6, 1), 20);

    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding,
      match_count,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const chunks = (data ?? []) as ChunkRow[];

    // 3) generate answer
    const prompt = buildPrompt(question, chunks);
    const answer = await generateAnswer(prompt);

    return NextResponse.json({
      answer,
      sources: chunks.map((c) => ({
        id: c.id,
        document_id: c.document_id ?? null,
        similarity: c.similarity ?? null,
        content: c.content,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
