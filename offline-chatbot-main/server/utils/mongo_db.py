from pymongo import MongoClient, errors
from datetime import datetime

# Initialize MongoDB client
try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["chatbot_db"]
    collection = db["chats"]
    print("✅ MongoDB connected successfully.")
except errors.ConnectionFailure as e:
    print(f"❌ MongoDB connection failed: {e}")
    client = None
    collection = None

def store_chat(conversation_id, user_msg, bot_msg, lang_iso):
    """
    Stores a single chat message in the MongoDB collection.

    Args:
        conversation_id (str): Unique ID for the conversation.
        user_msg (str): User's message.
        bot_msg (str): Bot's response.
        lang_iso (str): Language ISO code (e.g., 'en', 'hi').
    """
    if collection:
        chat = {
            "conversation_id": conversation_id,
            "user": user_msg,
            "assistant": bot_msg,
            "language": lang_iso,
            "timestamp": datetime.utcnow()
        }
        try:
            collection.insert_one(chat)
            print("📥 Chat inserted into database.")
        except errors.PyMongoError as e:
            print(f"❌ Failed to insert chat: {e}")
    else:
        print("⚠️ No MongoDB collection available. Skipping insert.")

def get_collection():
    """
    Returns the MongoDB collection object if available.

    Returns:
        Collection or None
    """
    return collection
