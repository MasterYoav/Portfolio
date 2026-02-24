export async function embedText(text: string): Promise<number[]> {
  const base = process.env.EMBEDDINGS_BASE_URL;
  if (!base) throw new Error("Missing EMBEDDINGS_BASE_URL");

  const res = await fetch(`${base}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Ollama embeddings API
    body: JSON.stringify({
      model: "nomic-embed-text",
      prompt: text,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Embeddings failed: ${res.status} ${t}`);
  }

  const json = await res.json();
  if (!json?.embedding || !Array.isArray(json.embedding)) {
    throw new Error("Embeddings response missing 'embedding'");
  }

  return json.embedding as number[];
}
