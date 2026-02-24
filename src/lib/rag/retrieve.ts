import { createClient } from "@supabase/supabase-js";

type Match = {
  id: number;
  source: string;
  chunk: string;
  metadata: any;
  similarity: number;
};

export async function retrieveTopK(queryEmbedding: number[], k = 6) {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server only
  const supabase = createClient(url, key);

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_count: k,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as Match[];
}
