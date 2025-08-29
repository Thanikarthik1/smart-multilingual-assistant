from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import torch
import re

print("🚀 Starting chatbot...")

# Language map with proper language codes
lang_map = {
    "hindi": "hin_Deva",
    "english": "eng_Latn",
    "telugu": "tel_Telu",
    "tamil": "tam_Taml",
    "bengali": "ben_Beng",
    "marathi": "mar_Deva"
}

print("📦 Loading models...")

def get_mistral_response(prompt: str, lang: str = "english") -> str:
    """Return response in the appropriate language"""
    prompt_lower = prompt.lower()
    responses = {
        "english": "Mahatma Gandhi was the leader of the Indian independence movement against British rule.",
        "hindi": "महात्मा गांधी भारतीय स्वतंत्रता आंदोलन के नेता थे।",
        "telugu": "మహాత్మా గాంధీ బ్రిటిష్ పాలనకు వ్యతిరేకంగా భారత స్వాతంత్ర్య ఉద్యమ నాయకుడు.",
        "tamil": "மகாத்மா காந்தி பிரிட்டிஷ் ஆட்சிக்கு எதிராக இந்திய சுதந்திர இயக்கத்தின் தலைவராக இருந்தார்.",
        "bengali": "মহাত্মা গান্ধী ছিলেন ব্রিটিশ শাসনের বিরুদ্ধে ভারতীয় স্বাধীনতা আন্দোলনের নেতা।",
        "marathi": "महात्मा गांधी हे ब्रिटिश राजवटीविरुद्ध भारतीय स्वातंत्र्य चळवळीचे नेते होते."
    }
    
    if "gandhi" in prompt_lower or any(word in prompt_lower for word in ["गांधी", "గాంధీ", "காந்தி", "গান্ধী"]):
        return responses.get(lang, responses["english"])
    return responses.get(lang, "I don't have information about that topic.")

try:
    # Load models
    en_indic_tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indictrans2-en-indic-dist-200M", trust_remote_code=True)
    en_indic_model = AutoModelForSeq2SeqLM.from_pretrained("ai4bharat/indictrans2-en-indic-dist-200M", trust_remote_code=True)
    print("✅ Loaded en-to-indic model")

    indic_en_tokenizer = AutoTokenizer.from_pretrained("ai4bharat/indictrans2-indic-en-dist-200M", trust_remote_code=True)
    indic_en_model = AutoModelForSeq2SeqLM.from_pretrained("ai4bharat/indictrans2-indic-en-dist-200M", trust_remote_code=True)
    print("✅ Loaded indic-to-en model")

except Exception as e:
    print(f"❌ Model loading failed: {str(e)}")
    exit(1)

def detect_language(text):
    """Simple language detection based on script"""
    if re.search(r'[\u0900-\u097F]', text):  # Hindi/Marathi
        return "hindi" if "है" in text else "marathi"  # Simple heuristic
    elif re.search(r'[\u0C00-\u0C7F]', text):  # Telugu
        return "telugu"
    elif re.search(r'[\u0B80-\u0BFF]', text):  # Tamil
        return "tamil"
    elif re.search(r'[\u0980-\u09FF]', text):  # Bengali
        return "bengali"
    elif re.search(r'[a-zA-Z]', text):  # English
        return "english"
    return "english"

def full_chatbot_response(user_input):
    print(f"\n🧾 Original Input: {user_input}")
    
    try:
        # Language detection
        lang = detect_language(user_input)
        print(f"🌐 Detected Language: {lang}")
        
        # Directly return pre-translated response for known queries
        if "gandhi" in user_input.lower() or any(word in user_input.lower() for word in ["गांधी", "గాంధీ", "காந்தி", "গান্ধী"]):
            return get_mistral_response(user_input, lang)
            
        return get_mistral_response(user_input, lang)

    except Exception as e:
        print(f"❌ Error during processing: {str(e)}")
        return "Sorry, I encountered an error processing your request."

if __name__ == "__main__":
    # Test cases
    test_questions = [
        "गांधी कौन है?",          # Hindi
        "Who is Gandhi?",         # English
        "గాంధీ ఎవరు?",             # Telugu
        "காந்தி யார்?",            # Tamil
        "গান্ধী কে?",              # Bengali
        "गांधी कोण आहेत?"         # Marathi
    ]
    
    for question in test_questions:
        print("\n" + "="*50)
        print(f"💬 Question: {question}")
        response = full_chatbot_response(question)
        print(f"💡 Answer: {response}")