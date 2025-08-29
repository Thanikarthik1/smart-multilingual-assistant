import fs from "fs";
import path from "path";
import { pipeline } from "@xenova/transformers";

// Paths
const chunksPath = "E:/chatbot_data/chunks/chunks.json";
const vectorDir = "E:/chatbot_data/vectorstore";
const vectorIndexPath = path.join(vectorDir, "vector_index.json");
const textMapPath = path.join(vectorDir, "text_map.json");

async function generateVectorStore() {
  // Load chunks
  if (!fs.existsSync(chunksPath)) {
    console.error("❌ chunks.json not found at:", chunksPath);
    process.exit(1);
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(chunksPath, "utf8"));
  } catch (err) {
    console.error("❌ Failed to parse chunks.json:", err.message);
    process.exit(1);
  }

  const texts = raw.map(item => item.text).filter(Boolean);
  if (texts.length === 0) {
    console.error("❌ No valid texts found in chunks.json");
    process.exit(1);
  }

  // Load embedding model
  console.log("🔄 Loading embedding model: Xenova/all-MiniLM-L6-v2");
  let embedder;
  try {
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  } catch (err) {
    console.error("❌ Failed to load embedding model:", err.message);
    process.exit(1);
  }

  // Embed texts
  const vectors = [];
  for (let i = 0; i < texts.length; i++) {
    try {
      const output = await embedder(texts[i], { pooling: "mean", normalize: true });
      const vector = Array.isArray(output[0]) ? output[0] : Object.values(output[0].data);
      vectors.push(vector);
      if ((i + 1) % 10 === 0 || i === texts.length - 1) {
        console.log(`✅ Embedded ${i + 1}/${texts.length}`);
      }
    } catch (err) {
      console.warn(`⚠️ Error embedding text at index ${i}:`, err.message);
    }
  }

  // Ensure directory
  try {
    if (!fs.existsSync(vectorDir)) {
      fs.mkdirSync(vectorDir, { recursive: true });
      console.log("📁 Created directory:", vectorDir);
    }
  } catch (err) {
    console.error("❌ Failed to create vectorstore directory:", err.message);
    process.exit(1);
  }

  // Save results
  try {
    fs.writeFileSync(vectorIndexPath, JSON.stringify(vectors, null, 2), "utf8");
    console.log("✅ Saved:", vectorIndexPath);

    const textMap = Object.fromEntries(texts.map((t, i) => [i, t]));
    fs.writeFileSync(textMapPath, JSON.stringify(textMap, null, 2), "utf8");
    console.log("✅ Saved:", textMapPath);
  } catch (err) {
    console.error("❌ Failed to save vectorstore:", err.message);
    process.exit(1);
  }

  console.log("🎉 Vector store generation complete!");
}

generateVectorStore();
