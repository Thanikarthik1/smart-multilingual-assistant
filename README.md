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
