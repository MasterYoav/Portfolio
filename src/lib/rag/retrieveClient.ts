export type RetrievedChunk = {
  id: string;
  content: string;
  similarity: number;
  document_id?: string;
};

export async function retrieveTopChunks(embedding: number[], k = 6) {
  const res = await fetch("/api/rag/retrieve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query_embedding: embedding, match_count: k }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error ?? "retrieve failed");
  return (json.chunks ?? []) as RetrievedChunk[];
}
