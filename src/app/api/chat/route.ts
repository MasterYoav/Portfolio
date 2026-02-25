// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type ChatReq = {
  message: string;
  topK?: number;
};

type MatchRow = {
  id: string;
  document_id: string;
  content: string;
  similarity: number | null;
};

function stripThink(s: string) {
  return s.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
}

function buildContextBlock(matches: MatchRow[]) {
  const top = matches.slice(0, 6);
  return top
    .map((m, i) => {
      const sim =
        typeof m.similarity === "number" ? m.similarity.toFixed(3) : "?";
      return `[#${i + 1} sim=${sim}]\n${(m.content ?? "").trim()}`;
    })
    .join("\n\n---\n\n");
}

async function embedViaRagEndpoint(origin: string, text: string) {
  const res = await fetch(`${origin}/api/rag/embed`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
    // helps avoid weird caching in some environments
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as any;

  if (!res.ok) {
    throw new Error(json?.error ?? `embed failed (${res.status})`);
  }
  if (!Array.isArray(json?.embedding) || json.embedding.length !== 384) {
    throw new Error(
      `embed returned invalid dims: ${json?.embedding?.length ?? "?"}`,
    );
  }
  return json.embedding as number[];
}

async function chatCompleteHF(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
) {
  const token = process.env.HF_TOKEN;
  const model = process.env.HF_CHAT_MODEL;

  if (!token || !model) {
    throw new Error("Missing HF_TOKEN or HF_CHAT_MODEL");
  }

  const r = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.2,
    }),
  });

  const data = (await r.json().catch(() => null)) as any;

  if (!r.ok) {
    throw new Error(data?.error ?? `HF chat failed (${r.status})`);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected HF chat response shape");
  }

  return stripThink(content);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatReq;
    const question = (body.message ?? "").trim();
    if (!question) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const topK = Math.min(Math.max(body.topK ?? 6, 1), 12);

    const supabaseUrl = process.env.SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Missing Supabase env vars" },
        { status: 500 },
      );
    }

    // IMPORTANT: use service role only on server routes (never expose it to client)
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 1) Embed via your deployed embed endpoint (guaranteed 384)
    const origin = new URL(req.url).origin;
    const qEmbedding = await embedViaRagEndpoint(origin, question);

    // 2) Retrieve top chunks
    const { data, error } = await supabase.rpc("match_chunks", {
      query_embedding: qEmbedding,
      match_count: topK,
    });

    if (error) {
      return NextResponse.json(
        { error: `match_chunks failed: ${error.message}` },
        { status: 500 },
      );
    }

    const matches = (Array.isArray(data) ? data : []) as any[];

    const sources: MatchRow[] = matches
      .map((m: any) => ({
        id: String(m.id),
        document_id: String(m.document_id),
        content: String(m.content ?? ""),
        similarity: typeof m.similarity === "number" ? m.similarity : null,
      }))
      .filter((s: MatchRow) => (s.content ?? "").trim().length > 0);

    if (sources.length === 0) {
      return NextResponse.json({
        answer:
          "לא מצאתי מידע רלוונטי במסמכי הפורטפוליו כדי לענות על זה. נסה לשאול משהו יותר ספציפי (ניסיון, פרויקטים, טכנולוגיות, לימודים).",
        sources: [],
      });
    }

    // 3) LLM answer strictly from context
    const context = buildContextBlock(sources);

    const system = `
אתה צ'אט באתר פורטפוליו.
ענה בעברית.
חובה: לענות *רק* על בסיס ה-Context שמופיע למטה.
אם אין מספיק מידע ב-Context כדי לענות בביטחון — תגיד שאין מספיק מידע במסמכים.
אל תמציא עובדות. אל תוסיף ידע חיצוני.
`.trim();

    const user = `
שאלה: ${question}

Context:
${context}
`.trim();

    const answer = await chatCompleteHF([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);

    return NextResponse.json({ answer, sources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
