"""FastAPI entry point — MongoDB + YOLOv8 + JWT + Role-based access."""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

load_dotenv()

from .database import connect_db, close_db
from .routers import auth, reports, dashboard, rewards, admin, driver


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await _seed_defaults()
    yield
    await close_db()


async def _seed_defaults():
    from .database import get_db
    from .auth import hash_password
    db = get_db()

    # Default rewards
    if await db.rewards.count_documents({}) == 0:
        await db.rewards.insert_many([
            {"name": "Movie Ticket",      "points_cost": 500,  "icon": "🎬", "available": True},
            {"name": "Coffee Voucher",    "points_cost": 200,  "icon": "☕", "available": True},
            {"name": "Bus Pass (1 Week)", "points_cost": 750,  "icon": "🚌", "available": True},
            {"name": "Shopping Voucher",  "points_cost": 1000, "icon": "🛍️", "available": True},
            {"name": "Eco T-Shirt",       "points_cost": 300,  "icon": "👕", "available": False},
            {"name": "Plant Sapling",     "points_cost": 150,  "icon": "🌱", "available": True},
        ])

    # Default admin account
    if not await db.users.find_one({"role": "admin"}):
        await db.users.insert_one({
            "name": "Admin", "email": "admin@ecotrack.com",
            "hashed_password": hash_password("admin123"),
            "role": "admin", "points": 0, "level": 1, "streak": 0,
        })
        print("[Seed] Admin: admin@ecotrack.com / admin123")

    # Default driver account
    if not await db.users.find_one({"role": "driver"}):
        await db.users.insert_one({
            "name": "Driver One", "email": "driver@ecotrack.com",
            "hashed_password": hash_password("driver123"),
            "role": "driver", "vehicle_id": "TN-01-AB-1234",
            "points": 0, "level": 1, "streak": 0,
        })
        print("[Seed] Driver: driver@ecotrack.com / driver123")


app = FastAPI(title="AI Urban Waste Platform", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(dashboard.router)
app.include_router(rewards.router)
app.include_router(admin.router)
app.include_router(driver.router)


@app.get("/health")
async def health():
    return {"status": "ok", "db": "mongodb", "ai": "yolov8"}
