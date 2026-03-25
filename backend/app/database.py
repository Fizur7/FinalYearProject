"""
MongoDB connection.
- If MONGODB_URL is reachable, uses real Motor (async) driver.
- If not reachable, falls back to mongomock-motor (in-memory) for development.
"""
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "waste_platform")

_client = None
_use_mock = False


def get_db():
    return _client[DB_NAME]


async def connect_db():
    global _client, _use_mock

    # Try real MongoDB first
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        c = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=2000)
        await c.admin.command("ping")
        _client = c
        _use_mock = False
        print(f"[DB] Connected to MongoDB: {MONGODB_URL}/{DB_NAME}")
    except Exception:
        # Fallback to in-memory mock (no MongoDB install needed)
        from mongomock_motor import AsyncMongoMockClient
        _client = AsyncMongoMockClient()
        _use_mock = True
        print("[DB] MongoDB not found — using in-memory mock (data resets on restart).")
        print("[DB] Install MongoDB for persistent storage: https://www.mongodb.com/try/download/community")


async def close_db():
    global _client
    if _client and not _use_mock:
        _client.close()
