"""
MongoDB connection — Atlas first, persistent JSON mock fallback.
Data survives restarts via mock_db.json when Atlas is unavailable.
"""
import os, json, asyncio
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "waste_platform")
PERSIST_FILE = os.path.join(os.path.dirname(__file__), "..", "mock_db.json")

_client = None
_use_mock = False


def get_db():
    return _client[DB_NAME]


def _json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


async def _dump_to_file():
    try:
        db = get_db()
        data = {}
        for col in ["users", "reports", "rewards", "achievements"]:
            docs = await db[col].find({}).to_list(10000)
            for doc in docs:
                if "_id" in doc:
                    doc["_id"] = str(doc["_id"])
            data[col] = docs
        with open(PERSIST_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, default=_json_serial, indent=2)
        print(f"[DB] Data saved ({sum(len(v) for v in data.values())} documents)")
    except Exception as e:
        print(f"[DB] Save failed: {e}")


async def _load_from_file():
    if not os.path.exists(PERSIST_FILE):
        return 0
    try:
        with open(PERSIST_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        db = get_db()
        from bson import ObjectId
        total = 0
        for col, docs in data.items():
            if not docs:
                continue
            # Only load if collection is empty (avoid duplicates)
            existing = await db[col].count_documents({})
            if existing > 0:
                continue
            for doc in docs:
                if "_id" in doc and isinstance(doc["_id"], str):
                    try:
                        doc["_id"] = ObjectId(doc["_id"])
                    except Exception:
                        pass
                # Restore datetime strings
                for k, v in list(doc.items()):
                    if isinstance(v, str) and len(v) > 18 and "T" in v:
                        try:
                            doc[k] = datetime.fromisoformat(v.replace("Z", "+00:00"))
                        except Exception:
                            pass
            await db[col].insert_many(docs)
            total += len(docs)
        if total:
            print(f"[DB] Restored {total} documents from {PERSIST_FILE}")
        return total
    except Exception as e:
        print(f"[DB] Restore failed: {e}")
        return 0


async def _auto_save():
    while True:
        await asyncio.sleep(20)
        await _dump_to_file()


async def connect_db():
    global _client, _use_mock

    # Try Atlas
    try:
        import certifi
        from motor.motor_asyncio import AsyncIOMotorClient
        c = AsyncIOMotorClient(
            MONGODB_URL,
            serverSelectionTimeoutMS=4000,
            connectTimeoutMS=4000,
            tlsCAFile=certifi.where()
        )
        await c.admin.command("ping")
        _client = c
        _use_mock = False
        print(f"[DB] ✓ Connected to MongoDB Atlas — {DB_NAME}")
        return
    except Exception as e:
        print(f"[DB] Atlas unavailable ({type(e).__name__}) — using persistent local DB")

    # Fallback: persistent mock
    from mongomock_motor import AsyncMongoMockClient
    _client = AsyncMongoMockClient()
    _use_mock = True
    restored = await _load_from_file()
    if restored:
        print(f"[DB] ✓ Persistent mock DB loaded — your data is intact")
    else:
        print(f"[DB] ✓ Fresh mock DB started — data will be saved to {PERSIST_FILE}")
    asyncio.create_task(_auto_save())


async def close_db():
    global _client
    if _use_mock:
        await _dump_to_file()
    elif _client:
        _client.close()
