# smart-multilingual-assistant
Multilingual Retrieval-Augmented Chatbot using FAISS, SERP API, and Llama 3. Supports Indian languages via translation, provides document + web-based answers, and stores conversation history in MongoDB for context-aware, accurate responses.

🚀 Overview

This chatbot is a hybrid RAG (Retrieval-Augmented Generation) system designed to provide reliable, multilingual, and context-aware responses. Unlike traditional chatbots that rely only on a pre-trained model, this system integrates:

FAISS vector database for fast and semantic document retrieval.

Web search (SERP API + web fetcher) for real-time answers when local docs don’t suffice.

Llama 3 (GGUF) as the reasoning backbone.

Multilingual support using translation pipelines for major Indian languages.

MongoDB persistence for storing conversation history.

🔑 Features

🌐 Hybrid Knowledge Source → Retrieves from local FAISS + falls back to Google search.

🧠 LLM-Powered Reasoning → Uses Llama 3 GGUF for natural, contextual answers.

🗂️ Document-Aware → Upload and query your own documents.

🌏 Multilingual Support → Supports all major Indian languages.

💾 Persistent Conversations → Chat history saved in MongoDB for continuity.

⚡ Efficient & Scalable → Optimized retrieval with FAISS and modular architecture.

📂 Tech Stack

LLM: Llama 3 (GGUF)

Retrieval: FAISS Vector Store

Web Search: SERP API + Web Fetcher

Database: MongoDB

Language Support: Translation Pipelines (Indian Languages)

Backend: Python



🚀 Setup Instructions

Follow these steps to set up and run the Smart Multilingual Assistant on your system.

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

🔽 Step 1: Clone the Repository
git clone https://github.com/Thanikarthik1/smart-multilingual-assistant.git
cd smart-multilingual-assistant/offline-chatbot-main

📥 Step 2: Create Model Folders

Inside the project, create the following folders:

mkdir -p llm/models
mkdir -p llm/hf_models/indictrans2

📥 Step 3: Download Required Models

Llama 3 GGUF (Quantized)
Download Meta-Llama-3-8B-Instruct.Q4_K_M.gguf
 and place it in:

llm/models/


IndicTrans2 Translation Models
Download from Hugging Face:

indictrans2-indic-en-dist-200M

indictrans2-en-indic-dist-200M

Place them in:

llm/hf_models/indictrans2/

⚙️ Step 4: Install Dependencies

Make sure you have Python 3.10+ installed, then run:

pip install -r requirements.txt


📌 requirements.txt includes:

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

Start the FastAPI server:

uvicorn server.main:app --reload


The API will run at:

http://127.0.0.1:8000


You can test endpoints at:

http://127.0.0.1:8000/docs

✅ Features Recap

🧠 Retrieval-Augmented Chatbot → Combines FAISS + Web search

🌏 Multilingual → Indian language support with IndicTrans2

💾 Persistent Chat History → MongoDB storage

⚡ Efficient → Optimized with quantized Llama 3
