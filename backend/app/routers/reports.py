"""MongoDB-based reports router with YOLOv8 AI integration."""
import uuid, os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from datetime import datetime, timezone
from .. import schemas
from ..auth import get_current_user
from ..database import get_db
from ..ai_service import analyze_image

router = APIRouter(prefix="/api/reports", tags=["reports"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
COLLECTION_UNITS = [
    {"id": "CU-001", "name": "Unit Alpha", "lat": 11.3410, "lng": 77.7172},
    {"id": "CU-002", "name": "Unit Beta",  "lat": 11.3450, "lng": 77.7200},
    {"id": "CU-003", "name": "Unit Gamma", "lat": 11.3380, "lng": 77.7150},
]

def _make_report_id(): return "RPT-" + uuid.uuid4().hex[:5].upper()
def _serialize(doc):
    doc["id"] = str(doc.pop("_id")); return doc
def _nearest_unit(lat, lng):
    if lat is None or lng is None: return COLLECTION_UNITS[0]["name"]
    return min(COLLECTION_UNITS, key=lambda u: (u["lat"]-lat)**2+(u["lng"]-lng)**2)["name"]

@router.post("/analyze")
async def analyze_only(image: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    return analyze_image(await image.read())

@router.post("/", response_model=schemas.ReportResponse)
async def create_report(
    location_address: Optional[str] = Form(None), lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None), waste_type: Optional[str] = Form(None),
    description: Optional[str] = Form(None), image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    image_path = None; image_bytes = None
    if image and image.filename:
        image_bytes = await image.read()
        filename = f"{uuid.uuid4().hex}_{image.filename}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        with open(image_path, "wb") as f: f.write(image_bytes)
    ai_data = {"waste_type": waste_type or "general", "confidence": None, "results": None}
    if image_bytes:
        ai_data = analyze_image(image_bytes); waste_type = ai_data["waste_type"]
    assigned_unit = _nearest_unit(lat, lng)
    now = datetime.now(timezone.utc)
    timeline = [
        {"status": "Submitted", "message": "Report submitted", "timestamp": now},
        {"status": "AI Analysis", "message": f"Classified as {waste_type}", "timestamp": now},
        {"status": "Assigned", "message": f"Assigned to {assigned_unit}", "timestamp": now},
    ]
    doc = {"report_id": _make_report_id(), "user_id": str(current_user["_id"]),
           "location_address": location_address, "lat": lat, "lng": lng,
           "waste_type": waste_type, "description": description, "image_path": image_path,
           "status": "Assigned", "priority": "high" if waste_type == "hazardous" else "medium",
           "ai_confidence": ai_data.get("confidence"), "ai_results": ai_data.get("results"),
           "assigned_unit": assigned_unit, "timeline": timeline, "created_at": now, "updated_at": now}
    result = await db.reports.insert_one(doc)
    await db.users.update_one({"_id": current_user["_id"]}, {"$inc": {"points": 10}})
    return _serialize(await db.reports.find_one({"_id": result.inserted_id}))

@router.get("/", response_model=list[schemas.ReportResponse])
async def list_reports(current_user: dict = Depends(get_current_user)):
    db = get_db()
    return [_serialize(r) async for r in db.reports.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)]

@router.get("/{report_id}", response_model=schemas.ReportResponse)
async def get_report(report_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.reports.find_one({"report_id": report_id})
    if not doc: raise HTTPException(status_code=404, detail="Report not found")
    return _serialize(doc)

@router.get("/{report_id}/timeline", response_model=list[schemas.TimelineEntryOut])
async def get_timeline(report_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await db.reports.find_one({"report_id": report_id})
    if not doc: raise HTTPException(status_code=404, detail="Report not found")
    return doc.get("timeline", [])

@router.patch("/{report_id}/status")
async def update_status(report_id: str, status: str, current_user: dict = Depends(get_current_user)):
    db = get_db(); now = datetime.now(timezone.utc)
    entry = {"status": status, "message": f"Status updated to {status}", "timestamp": now}
    result = await db.reports.update_one({"report_id": report_id},
        {"$set": {"status": status, "updated_at": now}, "$push": {"timeline": entry}})
    if result.matched_count == 0: raise HTTPException(status_code=404, detail="Report not found")
    return {"ok": True}
