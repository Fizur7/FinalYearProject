import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def test():
    try:
        c = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=3000)
        await c.admin.command("ping")
        print("MongoDB is running OK")
    except Exception as e:
        print(f"MongoDB NOT available: {e}")

asyncio.run(test())
