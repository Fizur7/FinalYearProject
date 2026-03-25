"""Request / Response schemas (Pydantic v2)."""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str; email: EmailStr; phone: Optional[str] = None
    location: Optional[str] = None; password: str

class DriverRegister(BaseModel):
    name: str; email: EmailStr; phone: Optional[str] = None
    location: Optional[str] = None; password: str; vehicle_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr; password: str

class TokenResponse(BaseModel):
    access_token: str; token_type: str = "bearer"; user: dict

class DriverInfo(BaseModel):
    id: str; name: str; email: str
    vehicle_id: Optional[str] = None; phone: Optional[str] = None


# ── Reports ───────────────────────────────────────────────────────────────────
class TimelineEntryOut(BaseModel):
    status: str; message: str; timestamp: datetime

class DriverUpdate(BaseModel):
    image_path: Optional[str] = None
    lat: Optional[float] = None; lng: Optional[float] = None
    note: Optional[str] = None; timestamp: datetime

class ReportResponse(BaseModel):
    id: str; report_id: str
    location_address: Optional[str]; lat: Optional[float]; lng: Optional[float]
    waste_type: Optional[str]; description: Optional[str]
    status: str; priority: str
    ai_confidence: Optional[float]; ai_results: Optional[dict]
    assigned_unit: Optional[str]; assigned_driver_id: Optional[str] = None
    driver_updates: List[dict] = []
    timeline: List[TimelineEntryOut] = []
    created_at: datetime


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    total_reports: int; pending_reports: int; completed_today: int
    avg_response_time: float; active_units: int


# ── Rewards ───────────────────────────────────────────────────────────────────
class RewardItem(BaseModel):
    id: str; name: str; points_cost: int; icon: str; available: bool

class LeaderboardEntry(BaseModel):
    rank: int; name: str; points: int; reports: int

class UserStats(BaseModel):
    name: str; rank: int; points: int; total_reports: int; level: int; streak: int
