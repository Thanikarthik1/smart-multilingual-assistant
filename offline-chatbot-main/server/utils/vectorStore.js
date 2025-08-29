import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers"; // or use other encoder
import * as readline from "readline";
import * as os from "os";

const chunksPath = path.resolve("server/chunks/chunks.json");
const vectorIndexPath = path.resolve("server/vectorstore/vector_index.json");
const textMapPath = path.resolve("server/vectorstore/text_map.json");

async function generateVectorStore() {
  if (!fs.existsSync(chunksPath)) {
    console.error("❌ chunks.json not found. Please upload and parse documents first.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(chunksPath, "utf-8"));
  const texts = data.map((item) => item.text);

  console.log("🔄 Loading embedding model...");
  const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  const vectors = [];

  for (const text of texts) {
    const output = await embedder(text, { pooling: "mean", normalize: true });
    vectors.push(output.data);
  }

  console.log("💾 Saving vector index and text map...");

  fs.writeFileSync(vectorIndexPath, JSON.stringify(vectors, null, 2));
  fs.writeFileSync(textMapPath, JSON.stringify(texts, null, 2));

  console.log("✅ Vectorstore generated successfully.");
}

generateVectorStore();
