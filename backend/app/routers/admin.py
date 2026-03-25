"""
Admin-only endpoints.
GET  /api/admin/reports              - all reports with filters
POST /api/admin/reports/{id}/approve - approve + assign driver
POST /api/admin/reports/{id}/reject  - reject report
GET  /api/admin/drivers              - list all drivers
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from bson import ObjectId
from .. import schemas
from ..auth import require_role
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _serialize(doc):
    doc["id"] = str(doc.pop("_id")); return doc


@router.get("/reports", response_model=list[schemas.ReportResponse])
async def all_reports(
    status: str = None,
    current_user: dict = Depends(require_role("admin")),
):
    db = get_db()
    query = {}
    if status:
        query["status"] = status
    cursor = db.reports.find(query).sort("created_at", -1)
    return [_serialize(r) async for r in cursor]


@router.post("/reports/{report_id}/approve")
async def approve_report(
    report_id: str,
    driver_id: str,
    current_user: dict = Depends(require_role("admin")),
):
    db = get_db()
    # Validate driver exists
    driver = await db.users.find_one({"_id": ObjectId(driver_id), "role": "driver"})
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    now = datetime.now(timezone.utc)
    entry = {"status": "Approved", "message": f"Approved by admin. Assigned to {driver['name']}", "timestamp": now}
    result = await db.reports.update_one(
        {"report_id": report_id},
        {"$set": {
            "status": "Assigned",
            "assigned_driver_id": driver_id,
            "assigned_unit": driver.get("vehicle_id", driver["name"]),
            "updated_at": now,
        }, "$push": {"timeline": entry}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"ok": True, "assigned_to": driver["name"]}


@router.post("/reports/{report_id}/reject")
async def reject_report(
    report_id: str,
    reason: str = "Does not meet criteria",
    current_user: dict = Depends(require_role("admin")),
):
    db = get_db()
    now = datetime.now(timezone.utc)
    entry = {"status": "Rejected", "message": f"Rejected: {reason}", "timestamp": now}
    result = await db.reports.update_one(
        {"report_id": report_id},
        {"$set": {"status": "Rejected", "updated_at": now}, "$push": {"timeline": entry}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"ok": True}


@router.get("/drivers")
async def list_drivers(current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    cursor = db.users.find({"role": "driver"})
    result = []
    async for u in cursor:
        assigned = await db.reports.count_documents({"assigned_driver_id": str(u["_id"]), "status": {"$in": ["Assigned", "In Progress"]}})
        result.append({
            "id": str(u["_id"]), "name": u["name"], "email": u["email"],
            "vehicle_id": u.get("vehicle_id"), "phone": u.get("phone"),
            "active_tasks": assigned,
        })
    return result
