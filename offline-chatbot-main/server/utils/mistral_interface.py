# mistral_interface.py  (updated)

import os
import json
import numpy as np
import faiss
import torch
from langdetect import detect
from sentence_transformers import SentenceTransformer
from llama_cpp import Llama
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import tiktoken
from server.utils.web_fetcher import fetch_web_results


# ==== Paths ====
VECTOR_PATH = "E:/chatbot_data/vectorstore/vector_index.json"
TEXT_MAP_PATH = "E:/chatbot_data/vectorstore/text_map.json"
LOCAL_MODEL_PATH = "E:/llm/models/Meta-Llama-3-8B-Instruct.Q4_K_M.gguf"
TRANSLATION_MODEL_INDIC_EN = "E:/llm/hf_models/indictrans2/indictrans2-indic-en-dist-200M"
TRANSLATION_MODEL_EN_INDIC = "E:/llm/hf_models/indictrans2/indictrans2-en-indic-dist-200M"

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# -------------------- Translator --------------------
class Translator:
    def __init__(self, model_path):
        if not os.path.isdir(model_path):
            raise FileNotFoundError(f"❌ Translation model path not found: {model_path}")
        try:
            print(f"🔄 Loading translation model from: {model_path}")
            self.tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True, trust_remote_code=True)
            self.model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True, trust_remote_code=True)
            self.model.eval()
            print(f"✅ Loaded translation model: {os.path.basename(model_path)}")
        except Exception as e:
            print(f"❌ Could not load model from {model_path}: {e}")
            self.tokenizer, self.model = None, None

    def translate(self, text: str) -> str:
        if not self.tokenizer or not self.model:
            print("⚠️ Skipping translation: model not loaded")
            return text
        try:
            inputs = self.tokenizer([text], return_tensors="pt", padding=True, truncation=True)
            with torch.no_grad():
                outputs = self.model.generate(**inputs, max_length=512)
            return self.tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]
        except Exception as e:
            print(f"❌ Translation error: {e}")
            return text

# Load translators
to_english = Translator(TRANSLATION_MODEL_INDIC_EN)
to_local   = Translator(TRANSLATION_MODEL_EN_INDIC)

# -------------------- Load Embedder --------------------
embedder = SentenceTransformer("distiluse-base-multilingual-cased-v2")
embedder_dim = embedder.get_sentence_embedding_dimension()

# -------------------- Load or Rebuild FAISS --------------------
with open(VECTOR_PATH, "r", encoding="utf-8") as f:
    embeddings = json.load(f)

if not embeddings or not isinstance(embeddings, list):
    raise ValueError("❌ vector_index.json is empty or malformed.")

embeddings_np = np.array(embeddings, dtype="float32")
stored_dim = embeddings_np.shape[1]

if stored_dim != embedder_dim:
    print(f"⚠️ Dimension mismatch: Stored={stored_dim}, Embedder={embedder_dim}")
    with open(TEXT_MAP_PATH, "r", encoding="utf-8") as f:
        text_map = json.load(f)
    texts = [text_map[str(i)] for i in range(len(text_map))]
    new_embeddings = embedder.encode(texts, convert_to_numpy=True, normalize_embeddings=False)
    embeddings_np = np.array(new_embeddings, dtype="float32")
    with open(VECTOR_PATH, "w", encoding="utf-8") as f:
        json.dump(embeddings_np.tolist(), f, ensure_ascii=False, indent=2)
    print("✅ vector_index.json updated with correct dimensions.")

index = faiss.IndexFlatL2(embedder_dim)
index.add(embeddings_np)

with open(TEXT_MAP_PATH, "r", encoding="utf-8") as f:
    text_map = json.load(f)
if not text_map or not isinstance(text_map, dict):
    raise ValueError("❌ text_map.json is empty or malformed.")

# -------------------- Load GGUF Model --------------------
print(f"🧠 Loading GGUF model from: {LOCAL_MODEL_PATH}")
llm = Llama(
    model_path=LOCAL_MODEL_PATH,
    n_ctx=4096,
    n_threads=4,
    n_batch=128,
    use_mlock=False,
    verbose=False
)
print("✅ GGUF model loaded successfully!")

# -------------------- Token Counter --------------------
def estimate_token_count(text: str) -> int:
    try:
        enc = tiktoken.encoding_for_model("gpt-3.5-turbo")
    except Exception:
        enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))

# -------------------- Prompts --------------------
LANG_PROMPTS = {
    "hi": "आप एक मददगार और विशेषज्ञ सहायक हैं। कृपया उत्तर केवल हिंदी में दें।",
    "te": "మీరు సహాయక మరియు నిపుణుడు. దయచేసి సమాధానాన్ని పూర్తిగా తెలుగులో ఇవ్వండి.",
    "ta": "நீங்கள் ஒரு உதவிகரமான மற்றும் நிபுணரான உதவியாளர். தயவுசெய்து பதில்களை முழுவதும் தமிழில் அளிக்கவும்.",
    "bn": "আপনি একজন সহায়ক এবং বিশেষজ্ঞ সহকারী। দয়া করে উত্তরটি পুরোপুরি বাংলায় দিন।",
    "ur": "آپ ایک مددگار اور ماہر معاون ہیں۔ براہ کرم جواب مکمل طور پر اردو میں دیں۔",
    "default": "You are a helpful and expert assistant. Please answer entirely in English."
}

# -------------------- Main Answer Function --------------------
def generate_answer(user_query: str, conversation_history: list = [], images: list = [], lang: str = None, system_message: str = None, model_name: str = "Meta-Llama-3-8B-Instruct"):
    print("✅ Starting generate_answer")

    # Detect language safely
    if not lang:
        try:
            # use detect only when query is reasonably long
            lang = detect(user_query) if len(user_query.split()) > 1 else "en"
        except Exception:
            lang = "en"
    print(f"🌐 Using language code: {lang}")

    if not system_message:
        system_message = LANG_PROMPTS.get(lang, LANG_PROMPTS["default"])

    # Translate query if needed (handle translation errors gracefully)
    try:
        translated_query = to_english.translate(user_query) if lang != "en" else user_query
    except Exception as e:
        print(f"⚠️ Translation-to-English failed: {e}")
        translated_query = user_query

    # Embed & search FAISS
    embedded_query = embedder.encode([translated_query], convert_to_numpy=True)
    print("✅ Embedded user query")
    D, I = index.search(embedded_query.astype("float32"), k=8)
    retrieved_chunks = [text_map[str(i)] for i in I[0] if str(i) in text_map]

    # Trim FAISS context to a token budget
    MAX_FAISS_TOKENS = 600
    faiss_context_parts = []
    current_tokens = 0
    for chunk in retrieved_chunks:
        chunk_tokens = estimate_token_count(chunk)
        if current_tokens + chunk_tokens > MAX_FAISS_TOKENS:
            break
        faiss_context_parts.append(chunk)
        current_tokens += chunk_tokens
    faiss_context = "\n".join(faiss_context_parts)

    if len(faiss_context.strip()) < 100 or np.mean(D[0]) > 0.7:
        print("⚠️ Weak FAISS results.")

    # Fetch & trim web search context
    try:
        web_context_full = fetch_web_results(translated_query) or ""
    except Exception as e:
        print(f"⚠️ Web fetch failed: {e}")
        web_context_full = ""
    MAX_WEB_TOKENS = 600
    web_context_tokens = web_context_full.split()
    if len(web_context_tokens) > MAX_WEB_TOKENS:
        web_context = " ".join(web_context_tokens[:MAX_WEB_TOKENS])
    else:
        web_context = web_context_full

    # Build context
    context = f"🌐 From Web Search:\n{web_context}\n\n📁 From Internal Knowledge:\n{faiss_context}"

    # Image note
    image_note = f"\nNote: User uploaded {len(images)} image(s)." if images else ""

    # Trim conversation history
    MAX_HISTORY_TOKENS = 400
    history_parts = []
    hist_tokens = 0
    for msg in reversed(conversation_history):
        entry = f"{msg.get('role', 'user')}: {msg.get('content', '')}\n"
        entry_tokens = estimate_token_count(entry)
        if hist_tokens + entry_tokens > MAX_HISTORY_TOKENS:
            break
        history_parts.insert(0, entry)
        hist_tokens += entry_tokens
    history_text = "".join(history_parts)

    # Build final prompt
    prompt = f"""{system_message}
{image_note}

Previous conversation:
{history_text}

Context:
{context}

User: {translated_query}
Assistant:"""

    # Ensure total tokens fit
    MAX_PROMPT_TOKENS = 3000
    total_tokens = estimate_token_count(prompt)
    if total_tokens > MAX_PROMPT_TOKENS:
        print(f"⚠️ Trimming prompt from {total_tokens} to {MAX_PROMPT_TOKENS} tokens")
        prompt_words = prompt.split()
        prompt = " ".join(prompt_words[:MAX_PROMPT_TOKENS])

    print("✅ Prompt ready, generating with model:", model_name)

    # Generate
    output = llm(prompt, max_tokens=1024, temperature=0.7, top_p=0.95, stop=["User:", "Assistant:"])
    reply = output["choices"][0]["text"].strip()

    # Translate reply back if needed
    if lang != "en":
        try:
            reply = to_local.translate(reply)
        except Exception as e:
            print(f"⚠️ Translation-to-local failed: {e}")

    return {
        "input_language": lang,
        "user_input": user_query,
        "reply": reply,
        "model_used": model_name
    }
