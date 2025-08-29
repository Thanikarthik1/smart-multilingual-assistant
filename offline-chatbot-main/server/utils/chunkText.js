// chunkText.js
import fs from "fs";

const rawChunksPath = "server/chunks/chunks.json";
const finalChunksPath = "server/chunks/chunks.json";

function chunkText(text, chunkSize = 500) {
  const words = text.split(" ");
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    chunks.push({ text: chunk });
  }
  return chunks;
}

const inputPath = process.argv[2]; // example: "server/uploads/example.txt"

const text = fs.readFileSync(inputPath, "utf8");
const chunks = chunkText(text);

fs.writeFileSync(finalChunksPath, JSON.stringify(chunks, null, 2), "utf8");

console.log(`✅ Chunked and saved to ${finalChunksPath}`);
