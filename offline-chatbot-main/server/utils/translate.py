import os
import uuid
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from llama_cpp import Llama
from langdetect import detect
from mongo_db import store_chat
from server.utils.mistral_interface import generate_answer

# ==== Paths ====
MODEL_PATH = "E:/llm/models/Meta-Llama-3-8B-Instruct.Q4_K_M.gguf"
TRANSLATION_MODEL_INDIC_EN = "E:/llm/hf_models/indictrans2/indictrans2-indic-en-dist-200M"
TRANSLATION_MODEL_EN_INDIC = "E:/llm/hf_models/indictrans2/indictrans2-en-indic-dist-200M"

# ==== Language Mappings ====
LANGUAGE_TAGS = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "bn": "ben_Beng",
    "gu": "guj_Gujr",
    "kn": "kan_Knda",
    "ml": "mal_Mlym",
    "mr": "mar_Deva",
    "or": "ory_Orya",
    "pa": "pan_Guru",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "as": "asm_Beng",
    "ur": "urd_Arab",
    "kok": "kok_Deva",
    "ne": "npi_Deva",
    "mai": "mai_Deva",
    "sd": "snd_Arab",
    "sa": "san_Deva",
    "doi": "doi_Deva",
    "mni": "mni_Mtei",
    "bho": "bho_Deva",
    "ks": "kas_Arab",
}

# ==== FastAPI App ====
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==== Pydantic Schemas ====
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    conversationHistory: List[Message]
    prompt: str
    model: Dict[str, str]
    systemMessage: Optional[str] = None
    images: Optional[List[str]] = []
    conversation_id: Optional[str] = None

# ==== Load LLM ====
print("🧠 Loading GGUF model from:", MODEL_PATH)
llm = Llama(model_path=MODEL_PATH)
print("✅ GGUF model loaded!")

# ==== Load Translation Models ====
print("🧠 Loading translation models...")
tokenizer_en_indic = AutoTokenizer.from_pretrained(
    TRANSLATION_MODEL_EN_INDIC,
    local_files_only=True,
    trust_remote_code=True
)
model_en_indic = AutoModelForSeq2SeqLM.from_pretrained(
    TRANSLATION_MODEL_EN_INDIC,
    local_files_only=True,
    trust_remote_code=True
)

tokenizer_indic_en = AutoTokenizer.from_pretrained(
    TRANSLATION_MODEL_INDIC_EN,
    local_files_only=True,
    trust_remote_code=True
)
model_indic_en = AutoModelForSeq2SeqLM.from_pretrained(
    TRANSLATION_MODEL_INDIC_EN,
    local_files_only=True,
    trust_remote_code=True
)
print("✅ Translation models loaded!")

# ==== Translation Function ====
def translate_text(text: str, src_lang: str, tgt_lang: str) -> str:
    # Skip translation if same language
    if src_lang == tgt_lang:
        return text

    # Only allow known language codes
    valid_tags = set(LANGUAGE_TAGS.values())
    if src_lang not in valid_tags:
        src_lang = "eng_Latn"
    if tgt_lang not in valid_tags:
        tgt_lang = "eng_Latn"

    try:
        if src_lang == "eng_Latn":
            tokenizer = tokenizer_en_indic
            model = model_en_indic
        else:
            tokenizer = tokenizer_indic_en
            model = model_indic_en

        prefix = f"{src_lang}⇒{tgt_lang}: "
        input_ids = tokenizer(prefix + text, return_tensors="pt").input_ids
        output_ids = model.generate(input_ids, max_length=512)
        return tokenizer.decode(output_ids[0], skip_special_tokens=True)

    except Exception as e:
        print(f"❌ Translation failed: {e}")
        return text

# ==== Chat Endpoint ====
@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.prompt

    try:
        detected_lang_code = detect(user_message)
        print(f"🔍 Detected language: {detected_lang_code}")
        src_lang_tag = LANGUAGE_TAGS.get(detected_lang_code, "eng_Latn")
    except Exception:
        detected_lang_code = "en"
        src_lang_tag = "eng_Latn"

    # Fallback for invalid tags
    if src_lang_tag not in LANGUAGE_TAGS.values():
        src_lang_tag = "eng_Latn"

    # Translate to English if needed
    if src_lang_tag != "eng_Latn":
        english_query = translate_text(user_message, src_lang_tag, "eng_Latn")
    else:
        english_query = user_message

    # Web scraping/search
    from server.utils.web_fetcher import fetch_web_results
    scraped_content = fetch_web_results(english_query)

    if not scraped_content.strip():
        print("⚠️ No relevant content found, skipping LLM to avoid guessing.")
        conversation_id = request.conversation_id or str(uuid.uuid4())
        store_chat(conversation_id, user_message, "Not available", detected_lang_code)
        return {
            "role": "assistant",
            "reply": "Not available",
            "detected_lang": detected_lang_code,
            "conversation_id": conversation_id
        }

    safe_prompt = (
        "Summarize the following information accurately. "
        "If there is no relevant company data, reply only with 'Not available'.\n\n"
        f"{scraped_content}"
    )

    try:
        result = generate_answer(
            user_query=safe_prompt,
            lang="eng_Latn",  # Always send English to LLM
            system_message=request.systemMessage,
            images=request.images,
            conversation_history=[msg.dict() for msg in request.conversationHistory],
            model_name=request.model.get("name", "Meta-Llama-3-8B-Instruct")
        )
        response = result["reply"]

    except Exception as e:
        return {
            "role": "assistant",
            "reply": f"❌ LLM error: {e}",
            "detected_lang": detected_lang_code
        }

    # Translate back if needed
    if src_lang_tag != "eng_Latn":
        final_reply = translate_text(response, "eng_Latn", src_lang_tag)
    else:
        final_reply = response

    conversation_id = request.conversation_id or str(uuid.uuid4())
    store_chat(conversation_id, user_message, final_reply, detected_lang_code)

    return {
        "role": "assistant",
        "reply": final_reply,
        "detected_lang": detected_lang_code,
        "conversation_id": conversation_id
    }
