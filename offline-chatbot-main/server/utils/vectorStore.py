import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from docx import Document
import fitz  # PyMuPDF

def read_files_from_folder(folder_path):
    chunks = []
    for root, _, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                if file.endswith(".json"):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = json.load(f)
                        chunks.append({"text": json.dumps(content, ensure_ascii=False), "source": file_path})
                elif file.endswith(".txt"):
                    with open(file_path, "r", encoding="utf-8") as f:
                        chunks.append({"text": f.read(), "source": file_path})
                elif file.endswith(".docx"):
                    doc = Document(file_path)
                    full_text = "\n".join([para.text for para in doc.paragraphs])
                    chunks.append({"text": full_text, "source": file_path})
                elif file.endswith(".pdf"):
                    pdf = fitz.open(file_path)
                    full_text = "".join([page.get_text() for page in pdf])
                    pdf.close()
                    chunks.append({"text": full_text, "source": file_path})
            except Exception as e:
                print(f"❌ Error reading {file_path}: {e}")
    return chunks

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))
    CHUNKS_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "chunks"))
    VECTORSTORE_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "vectorstore"))

    print(f"📂 Reading from uploads: {UPLOAD_FOLDER}")
    chunks = read_files_from_folder(UPLOAD_FOLDER)
    if not chunks:
        print("❌ No data found.")
        exit(1)

    os.makedirs(CHUNKS_FOLDER, exist_ok=True)
    os.makedirs(VECTORSTORE_FOLDER, exist_ok=True)

    with open(os.path.join(CHUNKS_FOLDER, "chunks.json"), "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    texts = [c["text"] for c in chunks]
    print("📊 Generating embeddings...")
    model = SentenceTransformer('sentence-transformers/distiluse-base-multilingual-cased-v1')
    vectors = model.encode(texts, normalize_embeddings=True)

    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(np.array(vectors).astype("float32"))

    faiss.write_index(index, os.path.join(VECTORSTORE_FOLDER, "vector_index.faiss"))
    with open(os.path.join(VECTORSTORE_FOLDER, "text_map.json"), "w", encoding="utf-8") as f:
        json.dump(texts, f, ensure_ascii=False, indent=2)

    print("✅ Vectorstore created successfully.")

if __name__ == "__main__":
    main()
