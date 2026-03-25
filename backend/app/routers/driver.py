"""
Driver-only endpoints.
GET  /api/driver/tasks              - assigned tasks for this driver
POST /api/driver/tasks/{id}/update  - upload image + location + status update
POST /api/driver/tasks/{id}/complete - mark as completed
"""
import uuid, os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from datetime import datetime, timezone
from .. import schemas
from ..auth import require_role
from ..database import get_db

router = APIRouter(prefix="/api/driver", tags=["driver"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def _serialize(doc):
    doc["id"] = str(doc.pop("_id")); return doc


@router.get("/tasks", response_model=list[schemas.ReportResponse])
async def my_tasks(current_user: dict = Depends(require_role("driver"))):
    db = get_db()
    cursor = db.reports.find({
        "assigned_driver_id": str(current_user["_id"]),
        "status": {"$in": ["Assigned", "In Progress"]},
    }).sort("created_at", -1)
    return [_serialize(r) async for r in cursor]


@router.get("/tasks/history", response_model=list[schemas.ReportResponse])
async def task_history(current_user: dict = Depends(require_role("driver"))):
    db = get_db()
    cursor = db.reports.find({"assigned_driver_id": str(current_user["_id"])}).sort("created_at", -1).limit(20)
    return [_serialize(r) async for r in cursor]


@router.post("/tasks/{report_id}/update")
async def update_task(
    report_id: str,
    note: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role("driver")),
):
    db = get_db()
    report = await db.reports.find_one({"report_id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.get("assigned_driver_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not assigned to you")

    image_path = None
    if image and image.filename:
        img_bytes = await image.read()
        filename = f"driver_{uuid.uuid4().hex}_{image.filename}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        with open(image_path, "wb") as f:
            f.write(img_bytes)

    now = datetime.now(timezone.utc)
    update_entry = {
        "image_path": image_path, "lat": lat, "lng": lng,
        "note": note or "Progress update", "timestamp": now,
        "driver_name": current_user["name"],
    }
    timeline_entry = {
        "status": "In Progress",
        "message": f"Driver update: {note or 'Progress update'}",
        "timestamp": now,
    }

    await db.reports.update_one(
        {"report_id": report_id},
        {"$set": {"status": "In Progress", "updated_at": now},
         "$push": {"driver_updates": update_entry, "timeline": timeline_entry}},
    )
    return {"ok": True}


@router.post("/tasks/{report_id}/complete")
async def complete_task(
    report_id: str,
    note: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role("driver")),
):
    db = get_db()
    report = await db.reports.find_one({"report_id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if report.get("assigned_driver_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not assigned to you")

    image_path = None
    if image and image.filename:
        img_bytes = await image.read()
        filename = f"driver_complete_{uuid.uuid4().hex}_{image.filename}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        with open(image_path, "wb") as f:
            f.write(img_bytes)

    now = datetime.now(timezone.utc)
    update_entry = {
        "image_path": image_path, "lat": lat, "lng": lng,
        "note": note or "Work completed", "timestamp": now,
        "driver_name": current_user["name"],
    }
    timeline_entry = {"status": "Completed", "message": "Waste collected. Work completed by driver.", "timestamp": now}

    await db.reports.update_one(
        {"report_id": report_id},
        {"$set": {"status": "Completed", "updated_at": now},
         "$push": {"driver_updates": update_entry, "timeline": timeline_entry}},
    )
    return {"ok": True}
