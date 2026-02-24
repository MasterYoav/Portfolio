// src/lib/rag/clientEmbed.ts
export type EmbedResponse = {
  embedding: number[];
  dims?: number;
};

export async function embedQuery(text: string): Promise<number[]> {
  const r = await fetch("/api/rag/embed", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`embed failed (${r.status}): ${t.slice(0, 200)}`);
  }

  const data = (await r.json()) as EmbedResponse;

  if (!Array.isArray(data.embedding)) {
    throw new Error("Unexpected embed response shape");
  }

  return data.embedding;
}
