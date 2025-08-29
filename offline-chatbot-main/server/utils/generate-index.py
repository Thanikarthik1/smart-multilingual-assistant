import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from docx import Document
import fitz  # PyMuPDF

def read_files_from_folder(folder_path):
    chunks = []
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                if file.endswith(".json"):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = json.load(f)
                        chunks.append({
                            "text": json.dumps(content, ensure_ascii=False),
                            "source": file_path
                        })
                elif file.endswith(".txt"):
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        chunks.append({
                            "text": content,
                            "source": file_path
                        })
                elif file.endswith(".docx"):
                    doc = Document(file_path)
                    full_text = "\n".join([para.text for para in doc.paragraphs])
                    chunks.append({
                        "text": full_text,
                        "source": file_path
                    })
                elif file.endswith(".pdf"):
                    pdf = fitz.open(file_path)
                    full_text = ""
                    for page in pdf:
                        full_text += page.get_text()
                    pdf.close()
                    chunks.append({
                        "text": full_text,
                        "source": file_path
                    })
            except Exception as e:
                print(f"❌ Error reading file {file_path}: {str(e)}")
    return chunks

def main():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    UPLOAD_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads"))
    CHUNKS_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "chunks"))
    VECTORSTORE_FOLDER = os.path.abspath(os.path.join(BASE_DIR, "..", "vectorstore"))

    print(f"📁 Reading files from uploads folder: {UPLOAD_FOLDER}")
    chunks = read_files_from_folder(UPLOAD_FOLDER)

    if len(chunks) == 0:
        print("❌ No files found or no text extracted from uploads folder.")
        exit(1)

    print(f"📦 Extracted {len(chunks)} text chunks from uploads.")

    os.makedirs(CHUNKS_FOLDER, exist_ok=True)
    os.makedirs(VECTORSTORE_FOLDER, exist_ok=True)

    chunks_json_path = os.path.join(CHUNKS_FOLDER, "chunks.json")
    with open(chunks_json_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"📝 Saved extracted chunks to {chunks_json_path}")

    texts = [chunk["text"] for chunk in chunks]

    print("🧠 Loading embedding model...")
    model = SentenceTransformer('sentence-transformers/distiluse-base-multilingual-cased-v1')

    print(f"⚙️ Encoding {len(texts)} text chunks into vectors...")
    vectors = model.encode(texts)
    print(f"✅ Vectors shape: {vectors.shape}")

    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(np.array(vectors).astype("float32"))
    print(f"📊 Added {index.ntotal} vectors to the FAISS index.")

    vector_index_path = os.path.join(VECTORSTORE_FOLDER, "vector_index.faiss")
    print(f"💾 Saving FAISS index to {vector_index_path} ...")
    faiss.write_index(index, vector_index_path)

    filesize = os.path.getsize(vector_index_path)
    print(f"📦 Index file size after saving: {filesize} bytes")

    if filesize == 0:
        print("❌ Error: Saved FAISS index file is empty!")
        exit(1)

    # ✅ FIXED: Save text_map as a dictionary instead of list
    text_map = {str(i): text for i, text in enumerate(texts)}
    text_map_path = os.path.join(VECTORSTORE_FOLDER, "text_map.json")
    with open(text_map_path, "w", encoding="utf-8") as f:
        json.dump(text_map, f, ensure_ascii=False, indent=2)
    print(f"✅ Saved text map to {text_map_path} (dict format)")

    print("🎉 Vector store creation completed successfully!")

if __name__ == "__main__":
    main()
