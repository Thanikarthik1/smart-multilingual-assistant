from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

model_path = "E:/llm/hf_models/indictrans2/indic-en/models--ai4bharat--indictrans2-indic-en-1B/snapshots/ac3daf0ecd37be3b6957764a9179ab2b07fa9d6a"

tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True, trust_remote_code=True)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path, local_files_only=True, trust_remote_code=True)

print("✅ Model loaded!")
