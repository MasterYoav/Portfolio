import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type Body = {
  query_embedding: number[]; // 384 dims
  match_count?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!Array.isArray(body.query_embedding)) {
      return NextResponse.json(
        { error: "query_embedding must be an array" },
        { status: 400 },
      );
    }
    if (body.query_embedding.length !== 384) {
      return NextResponse.json(
        { error: `Expected 384 dims, got ${body.query_embedding.length}` },
        { status: 400 },
      );
    }

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
      query_embedding: body.query_embedding,
      match_count,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chunks: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
