"""
Pydantic models for MongoDB documents.
MongoDB uses _id (ObjectId) as primary key — we expose it as string 'id'.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId


def utcnow():
    return datetime.now(timezone.utc)


# ── Helpers ──────────────────────────────────────────────────────────────────

class PyObjectId(str):
    """Serialize MongoDB ObjectId as plain string."""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if ObjectId.is_valid(str(v)):
            return str(v)
        raise ValueError(f"Invalid ObjectId: {v}")


# ── User ─────────────────────────────────────────────────────────────────────

class UserInDB(BaseModel):
    """Document stored in 'users' collection."""
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    hashed_password: str
    role: str = "citizen"   # citizen | admin | driver
    points: int = 0
    level: int = 1
    streak: int = 0
    vehicle_id: Optional[str] = None   # for drivers
    created_at: datetime = Field(default_factory=utcnow)


# ── Report ────────────────────────────────────────────────────────────────────

class TimelineEntry(BaseModel):
    status: str
    message: str
    timestamp: datetime = Field(default_factory=utcnow)


class ReportInDB(BaseModel):
    """Document stored in 'reports' collection."""
    report_id: str                        # e.g. RPT-A1B2C
    user_id: str                          # ObjectId string of user
    location_address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    waste_type: Optional[str] = None      # organic | recyclable | hazardous | general
    description: Optional[str] = None
    image_path: Optional[str] = None
    status: str = "Pending"               # Pending | Assigned | In Progress | Completed
    priority: str = "medium"
    ai_confidence: Optional[float] = None
    ai_results: Optional[dict] = None     # full YOLOv8 confidence breakdown
    assigned_unit: Optional[str] = None
    assigned_driver_id: Optional[str] = None   # ObjectId of driver user
    driver_updates: List[dict] = []            # [{image, lat, lng, note, timestamp}]
    timeline: List[TimelineEntry] = []
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


# ── Reward ────────────────────────────────────────────────────────────────────

class RewardInDB(BaseModel):
    name: str
    points_cost: int
    icon: str
    available: bool = True


# ── Achievement ───────────────────────────────────────────────────────────────

class AchievementInDB(BaseModel):
    name: str
    description: str
    required_count: int = 1
