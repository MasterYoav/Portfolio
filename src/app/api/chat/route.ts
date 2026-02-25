// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/rag/embed";

export const runtime = "nodejs";

type ChatReq = { message: string; topK?: number };

type MatchRow = {
  id: string;
  document_id: string | null;
  content: string;
  similarity: number | null;
};

function stripThink(s: string) {
  return s.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing env var: ${name}`);
  return v.trim();
}

function errDetails(e: unknown) {
  const anyE = e as any;
  return {
    name: anyE?.name,
    message: anyE?.message ?? String(e),
    stack: anyE?.stack,
    cause: anyE?.cause
      ? {
          name: anyE.cause?.name,
          message: anyE.cause?.message ?? String(anyE.cause),
          stack: anyE.cause?.stack,
        }
      : null,
  };
}

export async function POST(req: Request) {
  let stage = "start";

  try {
    stage = "parse_json";
    const { message, topK }: ChatReq = await req.json();

    const q = (message ?? "").trim();
    if (!q)
      return NextResponse.json({ error: "Missing message" }, { status: 400 });

    // ---- 1) EMBED ----
    stage = "embedText";
    const qEmbedding = await embedText(q);

    if (!Array.isArray(qEmbedding)) {
      return NextResponse.json(
        { error: "embedText did not return an array", stage },
        { status: 500 },
      );
    }
    if (qEmbedding.length !== 384) {
      return NextResponse.json(
        {
          error: `embedText returned ${qEmbedding.length} dims, expected 384`,
          stage,
        },
        { status: 500 },
      );
    }

    // ---- 2) SUPABASE RPC ----
    stage = "supabase_init";
    const supabase = createClient(
      mustEnv("SUPABASE_URL"),
      mustEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } },
    );

    const k = Math.min(Math.max(topK ?? 6, 1), 12);

    stage = "supabase_rpc_match_chunks";
    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding: qEmbedding,
      match_count: k,
    });

    if (error) {
      return NextResponse.json(
        { error: `match_chunks failed: ${error.message}`, stage },
        { status: 500 },
      );
    }

    const sources: MatchRow[] = (Array.isArray(data) ? data : [])
      .map((m: any) => ({
        id: String(m.id),
        document_id: m.document_id ?? null,
        content: String(m.content ?? ""),
        similarity: typeof m.similarity === "number" ? m.similarity : null,
      }))
      .filter((s) => s.content.trim().length > 0);

    // ---- 3) PROMPT ----
    stage = "build_prompt";
    const context = sources
      .slice(0, 6)
      .map((s, i) => `[#${i + 1} | sim ${s.similarity ?? "?"}]\n${s.content}`)
      .join("\n\n---\n\n");

    const system = [
      "You are Yoav's portfolio assistant.",
      "Answer ONLY using the provided CONTEXT.",
      "If the context doesn't contain the answer, say you don't have enough information in the portfolio knowledge base.",
      "Be concise, correct, and avoid guessing.",
      "Do NOT mention hidden chain-of-thought.",
    ].join(" ");

    // ---- 4) HF CHAT ----
    stage = "hf_env";
    const hfToken = mustEnv("HF_TOKEN");
    const model = mustEnv("HF_CHAT_MODEL");
    const url = "https://router.huggingface.co/v1/chat/completions";

    const payload = {
      model,
      stream: false,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `CONTEXT:\n${context || "(empty)"}\n\nQUESTION:\n${q}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 350,
    };

    stage = "hf_fetch";
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    stage = "hf_read_text";
    const raw = await resp.text();

    if (!resp.ok) {
      return NextResponse.json(
        {
          error: `HF chat failed (${resp.status})`,
          stage,
          details: { model, sample: raw.slice(0, 700) },
        },
        { status: 500 },
      );
    }

    stage = "hf_parse_json";
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          error: "HF returned non-JSON",
          stage,
          details: { sample: raw.slice(0, 700) },
        },
        { status: 500 },
      );
    }

    stage = "hf_extract_answer";
    const answerRaw = json?.choices?.[0]?.message?.content ?? "";
    const answer = stripThink(String(answerRaw || "")).trim();

    return NextResponse.json({
      answer: answer || "No answer returned by model.",
      sources,
      meta: { model, used_chunks: sources.length },
    });
  } catch (e) {
    // פה נקבל סוף סוף את ה־cause האמיתי של "fetch failed"
    return NextResponse.json(
      { error: "Unhandled exception", stage, details: errDetails(e) },
      { status: 500 },
    );
  }
}
