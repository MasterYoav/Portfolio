// scripts/ingest-rag.ts
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { pipeline } from "@xenova/transformers";

function chunkText(input: string, chunkSize = 900, overlap = 140) {
  const text = input.replace(/\r/g, "");
  const chunks: string[] = [];
  let i = 0;

  while (i < text.length) {
    const end = Math.min(i + chunkSize, text.length);
    const slice = text.slice(i, end).trim();
    if (slice) chunks.push(slice);
    if (end === text.length) break;
    i = Math.max(0, end - overlap);
  }

  return chunks;
}

function meanPool(vectors: number[][]): number[] {
  const dim = vectors[0]?.length ?? 0;
  const out = new Array(dim).fill(0);
  for (const v of vectors) {
    for (let i = 0; i < dim; i++) out[i] += v[i];
  }
  for (let i = 0; i < dim; i++) out[i] /= vectors.length;
  return out;
}

function l2Normalize(vec: number[]): number[] {
  let norm = 0;
  for (const x of vec) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  return vec.map((x) => x / norm);
}

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL) throw new Error("Missing SUPABASE_URL in .env.local");
  if (!SERVICE_KEY)
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in .env.local");

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });

  const contentDir = path.join(process.cwd(), "content", "rag");
  if (!fs.existsSync(contentDir)) {
    throw new Error(`Missing folder: ${contentDir}`);
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    throw new Error(`No .md files found in ${contentDir}`);
  }

  // Local embedding model (384 dims)
  // This downloads model files on first run.
  console.log("Loading embedding model: Xenova/all-MiniLM-L6-v2 ...");
  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
  );

  // NOTE: We previously wiped chunks/documents in Supabase, so we just insert fresh.
  for (const file of files) {
    const full = path.join(contentDir, file);
    const raw = fs.readFileSync(full, "utf8");

    if (!raw.trim()) {
      console.log(`⚠️  ${file} is empty. Skipping.`);
      continue;
    }

    const chunks = chunkText(raw);
    console.log(`Document ${file} -> ${chunks.length} chunks`);

    // Insert document
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .insert({ title: file, source: "content/rag" })
      .select("id")
      .single();

    if (docErr) throw new Error(`documents insert failed: ${docErr.message}`);
    const documentId = doc.id as string;

    // Insert chunks
    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i];

      // Extract token embeddings -> mean pool -> normalize
      // extractor returns a Tensor-like object; .tolist() gives nested arrays
      const out: any = await extractor(content, {
        pooling: "none",
        normalize: false,
      });
      // out.tolist() can be either number[][] or number[][][] depending on the model/runtime.
      // Normalize to number[][] (sequence_len x dim).
      function to2D(x: unknown): number[][] {
        if (!Array.isArray(x))
          throw new Error("Embedding output is not an array");

        // case: number[][][]
        if (Array.isArray(x[0]) && Array.isArray((x as any)[0][0])) {
          return (x as number[][][])[0];
        }

        // case: number[][]
        if (Array.isArray(x[0]) && typeof (x as any)[0][0] === "number") {
          return x as number[][];
        }

        throw new Error("Unexpected embedding output shape");
      }

      const raw = await out.tolist();
      const tokenVecs = to2D(raw);
      const emb = l2Normalize(meanPool(tokenVecs));
      if (emb.length !== 384) {
        throw new Error(
          `Embedding dim mismatch: got ${emb.length}, expected 384`,
        );
      }

      const { error: chErr } = await supabase.from("chunks").insert({
        document_id: documentId,
        content,
        embedding: emb,
      });

      if (chErr) throw new Error(`chunks insert failed: ${chErr.message}`);
    }
  }

  console.log("✅ Ingest complete (384-d embeddings)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
