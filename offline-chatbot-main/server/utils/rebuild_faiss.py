import json
import numpy as np
import faiss
import os

# === Path setup ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VECTOR_JSON = os.path.join(BASE_DIR, "vector_index.json")
FAISS_INDEX = os.path.join(BASE_DIR, "vector_index.faiss")

# === Load vectors from vector_index.json ===
with open(VECTOR_JSON, "r", encoding="utf-8") as f:
    vectors = json.load(f)

# === Convert to numpy float32 ===
np_vectors = np.array(vectors, dtype="float32")
print(f"Loaded {np_vectors.shape[0]} vectors of dimension {np_vectors.shape[1]}")

# === Create FAISS index ===
dimension = np_vectors.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(np_vectors)

# === Save index ===
faiss.write_index(index, FAISS_INDEX)
print(f"✅ FAISS index saved at: {FAISS_INDEX}")
