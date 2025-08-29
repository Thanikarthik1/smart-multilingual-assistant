from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# English to Indic
model_id_en_indic = "ai4bharat/indictrans2-en-indic-1B"
tokenizer_en_indic = AutoTokenizer.from_pretrained(model_id_en_indic, trust_remote_code=True, cache_dir="E:/llm/hf_models/indictrans2/en-indic")
model_en_indic = AutoModelForSeq2SeqLM.from_pretrained(model_id_en_indic, trust_remote_code=True, cache_dir="E:/llm/hf_models/indictrans2/en-indic")

# Indic to English
model_id_indic_en = "ai4bharat/indictrans2-indic-en-1B"
tokenizer_indic_en = AutoTokenizer.from_pretrained(model_id_indic_en, trust_remote_code=True, cache_dir="E:/llm/hf_models/indictrans2/indic-en")
model_indic_en = AutoModelForSeq2SeqLM.from_pretrained(model_id_indic_en, trust_remote_code=True, cache_dir="E:/llm/hf_models/indictrans2/indic-en")
