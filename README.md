🌐 Smart Multilingual Assistant

A Multilingual Retrieval-Augmented Chatbot powered by FAISS, SERP API, and Llama 3 (GGUF) with support for Indian languages via translation.
Provides document + web-based answers and stores conversations in MongoDB for context-aware, accurate responses.

✨ Overview

This chatbot is a hybrid RAG (Retrieval-Augmented Generation) system that combines:

⚡ FAISS vector database → Fast & semantic document retrieval

🌍 Web search (SERP API + web fetcher) → Real-time answers when local docs don’t suffice

🧠 Llama 3 (GGUF) → Contextual & natural reasoning backbone

🌏 IndicTrans2 → Multilingual support for Indian languages

💾 MongoDB → Persistent conversation history

🔑 Features

✅ Hybrid Knowledge Source → Local FAISS + Google search fallback
✅ LLM-Powered Reasoning → Natural & context-aware answers
✅ Document-Aware → Upload and query your own docs
✅ Multilingual → All major Indian languages supported
✅ Persistent Conversations → Saved in MongoDB
✅ Efficient & Scalable → Quantized Llama 3 for optimized inference

🛠️ Tech Stack

LLM → Llama 3 (GGUF Quantized)

Retrieval → FAISS Vector Store

Search → SERP API + Web Fetcher

Database → MongoDB

Language Support → IndicTrans2 Pipelines

Backend → FastAPI (Python)

📂 Project Structure
smart-multilingual-assistant/
│── offline-chatbot-main/
│   ├── server/
│   │   ├── utils/
│   │   ├── mistral_interface.py
│   │   ├── mongo_db.py
│   │   └── ...
│   ├── llm/
│   │   ├── models/
│   │   │   └── Meta-Llama-3-8B-Instruct.Q4_K_M.gguf
│   │   └── hf_models/
│   │       └── indictrans2/
│   │           ├── indictrans2-indic-en-dist-200M
│   │           └── indictrans2-en-indic-dist-200M
│   ├── requirements.txt
│   └── ...

🚀 Setup Instructions
🔽 Step 1: Clone the Repository
git clone https://github.com/Thanikarthik1/smart-multilingual-assistant.git
cd smart-multilingual-assistant/offline-chatbot-main

📥 Step 2: Create Model Folders
mkdir -p llm/models
mkdir -p llm/hf_models/indictrans2

📥 Step 3: Download Required Models

Llama 3 GGUF (Quantized)

Download Meta-Llama-3-8B-Instruct.Q4_K_M.gguf

Place it in:

llm/models/


IndicTrans2 Translation Models
Download from Hugging Face:

indictrans2-indic-en-dist-200M

indictrans2-en-indic-dist-200M

Place them in:

llm/hf_models/indictrans2/

⚙️ Step 4: Install Dependencies
pip install -r requirements.txt


📌 Key dependencies (requirements.txt):

fastapi
uvicorn
transformers
torch==2.1.2
torchvision==0.16.2+cpu
sentence-transformers
langdetect
faiss-cpu
python-multipart
numpy==1.23.5
requests
beautifulsoup4

▶️ Step 5: Run the Backend
uvicorn server.main:app --reload


The API will run at:
👉 http://127.0.0.1:8000

Test endpoints at:
👉 http://127.0.0.1:8000/docs

📊 Architecture (Optional Visual)

(Add a diagram showing flow: User → Translation → FAISS + SERP → Llama 3 → MongoDB → Response)

✅ Features Recap

🧠 RAG Chatbot → FAISS + Web Search

🌏 Multilingual → Powered by IndicTrans2

💾 Persistent → MongoDB storage

⚡ Optimized → Quantized Llama 3

🤝 Contributing

Contributions are welcome! 🎉

Fork the repo

Create a new branch (feature/my-feature)

Commit changes (git commit -m "Added feature")

Push (git push origin feature/my-feature)

Open a Pull Request 🚀
