// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/rag/embed";

export const runtime = "nodejs";

type ChatReq = {
  message: string;
  topK?: number;
};

type MatchRow = {
  id: string;
  document_id?: string;
  content?: string;
  similarity?: number | null;
};

function stripThink(s: string) {
  return s.replace(/<think>[\s\S]*?<\/think>\s*/g, "").trim();
}

function buildContext(rows: MatchRow[]) {
  // שומר קצר כדי לא לשרוף טוקנים
  return rows
    .slice(0, 6)
    .map((r, i) => `[#${i + 1}] ${String(r.content ?? "").trim()}`)
    .filter((x) => x.length > 0)
    .join("\n\n");
}

async function hfChat(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
) {
  const token = process.env.HF_TOKEN;
  const model = process.env.HF_CHAT_MODEL;

  if (!token || !model) {
    throw new Error("Missing HF_TOKEN or HF_CHAT_MODEL");
  }

  const res = await fetch("https://router.huggingface.co/v1/chat/completions", {
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

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HF chat failed (${res.status}): ${txt.slice(0, 400)}`);
  }

  const data = (await res.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("Unexpected HF response shape");
  }
  return stripThink(content);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatReq;
    const message = (body.message ?? "").trim();
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const topK = Math.min(Math.max(body.topK ?? 6, 1), 12);

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Missing Supabase env vars" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // 1) embed לשאלה
    const qEmbedding = await embedText(message);

    // 2) retrieve
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

    const matches = (Array.isArray(data) ? data : []) as MatchRow[];
    const sources = matches
      .map((m) => ({
        id: m.id,
        document_id: m.document_id,
        content: (m.content ?? "").trim(),
        similarity: m.similarity ?? null,
      }))
      .filter((s) => s.content.length > 0);

    // אם אין מקורות — לא מאפשרים הזיה
    if (sources.length === 0) {
      return NextResponse.json({
        answer:
          "לא מצאתי מידע רלוונטי במסמכים שלי כדי לענות. נסה לשאול משהו יותר ספציפי על פרויקטים/ניסיון/טכנולוגיות.",
        sources: [],
      });
    }

    const context = buildContext(sources);

    // 3) מחייבים את המודל להשתמש בקונטקסט בלבד
    const system = `
אתה עוזר אישי עבור אתר פורטפוליו של Yoav.
כללי ברזל:
1) אתה עונה *רק* מתוך ה-Context שסופק לך.
2) אם התשובה לא נמצאת ב-Context — תגיד: "אין לי מספיק מידע במסמכים שלי כדי לענות."
3) אל תמציא עובדות. אל תשתמש בידע כללי.
4) ענה בעברית בקצרה וברור.
`;

    const user = `
Context:
${context}

Question:
${message}
`;

    const answer = await hfChat([
      { role: "system", content: system.trim() },
      { role: "user", content: user.trim() },
    ]);

    return NextResponse.json({ answer, sources });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
