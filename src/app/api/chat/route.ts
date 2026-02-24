// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { embedText } from "@/lib/rag/embed"; // אתה כבר משתמש בזה ב-ingest

export const runtime = "nodejs"; // חשוב: pgvector + supabase-js

type ChatReq = {
  message: string;
  topK?: number;
};

const supabase = createClient(
  process.env.SUPABASE_URL!,
  // לשאילתות SELECT על public עם RLS מתאים – anon מספיק.
  // אם אין לך RLS/מדיניות – תצטרך service role (אבל אז זה חייב להיות רק בשרת).
  process.env.SUPABASE_ANON_KEY!,
);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatReq;

    const message = (body.message ?? "").trim();
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const topK = Math.min(Math.max(body.topK ?? 6, 1), 12);

    // 1) embed לשאלה
    const qEmbedding = await embedText(message);

    // 2) RPC ל-match_chunks (כמו שבנית ב-SQL)
    const { data: matches, error } = await supabase.rpc("match_chunks", {
      query_embedding: qEmbedding,
      match_count: topK,
    });

    if (error) {
      return NextResponse.json(
        { error: `match_chunks failed: ${error.message}` },
        { status: 500 },
      );
    }

    const sources = (matches ?? [])
      .map((m: any) => ({
        id: m.id,
        doc: m.doc ?? m.document ?? m.source ?? "unknown",
        content: m.content ?? m.text ?? "",
        similarity: m.similarity ?? m.score ?? null,
      }))
      .filter((s) => s.content && s.content.trim().length > 0);

    // 3) תשובה "Free + עובד":
    // מחזירים תשובה מסכמת קצרה + מצרפים את הקטעים כרפרנס.
    // בהמשך נחליף את זה ל-LLM שמנסח.
    const answer =
      sources.length === 0
        ? "לא מצאתי מידע מספיק במסמכים שלי כדי לענות על זה. נסה לשאול משהו יותר ספציפי על ניסיון/פרויקטים/טכנולוגיות."
        : buildExtractiveAnswer(message, sources);

    return NextResponse.json({ answer, sources });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}

function buildExtractiveAnswer(
  question: string,
  sources: Array<{ doc: string; content: string }>,
) {
  // מייצר תשובה קצרה שמבוססת על top chunks (בלי LLM).
  // זה “פחות GPT”, אבל 100% עובד וחינמי ומבוסס ידע שלך.
  const bullets = sources
    .slice(0, 4)
    .map((s) => cleanSnippet(s.content))
    .filter(Boolean);

  const header = `על בסיס המסמכים שלי, הנה מה שרלוונטי לשאלה שלך:`;
  return [header, ...bullets.map((b) => `• ${b}`)].join("\n");
}

function cleanSnippet(s: string) {
  const oneLine = s.replace(/\s+/g, " ").trim();
  // חותכים כדי שלא יחזיר מגילה
  return oneLine.length > 220 ? oneLine.slice(0, 220) + "…" : oneLine;
}
