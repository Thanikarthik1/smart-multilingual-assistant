import os
import sys
import json
import numpy as np
import torch
import warnings
from langdetect import detect
from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
import faiss

warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

EN_TO_INDIC_MODEL = "ai4bharat/indictrans2-en-indic-1B"
INDIC_TO_EN_MODEL = "ai4bharat/indictrans2-indic-en-1B"

device = 0 if torch.cuda.is_available() else -1

translator_en2indic = pipeline(
    "translation",
    model=AutoModelForSeq2SeqLM.from_pretrained(EN_TO_INDIC_MODEL, trust_remote_code=True),
    tokenizer=AutoTokenizer.from_pretrained(EN_TO_INDIC_MODEL, trust_remote_code=True),
    device=device
)

translator_indic2en = pipeline(
    "translation",
    model=AutoModelForSeq2SeqLM.from_pretrained(INDIC_TO_EN_MODEL, trust_remote_code=True),
    tokenizer=AutoTokenizer.from_pretrained(INDIC_TO_EN_MODEL, trust_remote_code=True),
    device=device
)

lang_map = {
    "hi": "hi", "te": "te", "ta": "ta", "ml": "ml", "kn": "kn",
    "bn": "bn", "gu": "gu", "mr": "mr", "pa": "pa", "as": "as",
    "or": "or", "ur": "ur", "en": "en"
}

def detect_lang(text):
    try:
        lang = detect(text)
        return lang_map.get(lang, "en")
    except:
        return "en"

def translate_text(text, src_lang, tgt_lang):
    try:
        if src_lang == "en" and tgt_lang != "en":
            return translator_en2indic(f"{src_lang}>>{tgt_lang}<< {text}", max_length=512)[0]["translation_text"]
        elif src_lang != "en" and tgt_lang == "en":
            return translator_indic2en(f"{src_lang}>>{tgt_lang}<< {text}", max_length=512)[0]["translation_text"]
        return text
    except Exception as e:
        return f"[Translation Error: {str(e)}]"

# Load model
model_embed = SentenceTransformer('sentence-transformers/distiluse-base-multilingual-cased-v1')

# File paths
VECTOR_INDEX_PATH = os.path.join("server", "vectorstore", "vector_index.faiss")
TEXT_MAP_PATH = os.path.join("server", "vectorstore", "text_map.json")

index = faiss.read_index(VECTOR_INDEX_PATH)
with open(TEXT_MAP_PATH, "r", encoding="utf-8") as f:
    texts = json.load(f)

# Process user query
if len(sys.argv) < 2:
    print("Usage: python query-vector.py 'your question here'")
    sys.exit(1)

query = sys.argv[1]
detected_lang = detect_lang(query)
query_en = translate_text(query, detected_lang, "en") if detected_lang != "en" else query

query_vector = model_embed.encode([query_en], normalize_embeddings=True)

D, I = index.search(np.array(query_vector).astype("float32"), k=3)

# Check similarity threshold
threshold = 0.6
answers = [texts[i] for i, score in zip(I[0], D[0]) if score >= threshold]

if not answers:
    print("Sorry, I couldn't find a relevant answer.")
else:
    response_en = "\n".join(answers)
    response = translate_text(response_en, "en", detected_lang) if detected_lang != "en" else response_en
    print(response)
