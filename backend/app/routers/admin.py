"""Admin CRUD endpoints — Reports, Citizens, Drivers."""
from fastapi import APIRouter, Depends, HTTPException, Body
from datetime import datetime, timezone
from bson import ObjectId
from pydantic import BaseModel, EmailStr
from typing import Optional
from .. import schemas
from ..auth import require_role, hash_password
from ..database import get_db

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _s(doc):
    doc["id"] = str(doc.pop("_id")); return doc


async def _with_citizen(r, db):
    try:
        c = await db.users.find_one({"_id": ObjectId(r["user_id"])})
        r["citizen_name"]     = c["name"]            if c else "Unknown"
        r["citizen_email"]    = c["email"]            if c else ""
        r["citizen_phone"]    = c.get("phone","")     if c else ""
        r["citizen_location"] = c.get("location","")  if c else ""
    except Exception:
        r["citizen_name"] = "Unknown"; r["citizen_email"] = ""; r["citizen_phone"] = ""; r["citizen_location"] = ""
    return r


# ── REPORTS ──────────────────────────────────────────────────────────────────

@router.get("/reports")
async def all_reports(status: str = None, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    query = {} if not status else {"status": status}
    results = []
    async for r in db.reports.find(query).sort("created_at", -1):
        r["id"] = str(r.pop("_id"))
        results.append(await _with_citizen(r, db))
    return results


@router.get("/reports/{report_id}/detail")
async def report_detail(report_id: str, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    r = await db.reports.find_one({"report_id": report_id})
    if not r: raise HTTPException(404, "Report not found")
    r["id"] = str(r.pop("_id"))
    return await _with_citizen(r, db)


class ReportUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    location_address: Optional[str] = None
    description: Optional[str] = None

@router.put("/reports/{report_id}")
async def update_report(report_id: str, data: ReportUpdate, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates: raise HTTPException(400, "Nothing to update")
    updates["updated_at"] = datetime.now(timezone.utc)
    if "status" in updates:
        entry = {"status": updates["status"], "message": f"Status changed to {updates['status']} by admin", "timestamp": updates["updated_at"]}
        await db.reports.update_one({"report_id": report_id}, {"$set": updates, "$push": {"timeline": entry}})
    else:
        await db.reports.update_one({"report_id": report_id}, {"$set": updates})
    r = await db.reports.find_one({"report_id": report_id})
    if not r: raise HTTPException(404, "Report not found")
    r["id"] = str(r.pop("_id"))
    return await _with_citizen(r, db)


@router.delete("/reports/{report_id}")
async def delete_report(report_id: str, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    result = await db.reports.delete_one({"report_id": report_id})
    if result.deleted_count == 0: raise HTTPException(404, "Report not found")
    return {"ok": True}


@router.post("/reports/{report_id}/approve")
async def approve_report(report_id: str, driver_id: str, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    driver = await db.users.find_one({"_id": ObjectId(driver_id), "role": "driver"})
    if not driver: raise HTTPException(404, "Driver not found")
    now = datetime.now(timezone.utc)
    entry = {"status": "Approved", "message": f"Approved by admin. Assigned to {driver['name']}", "timestamp": now}
    result = await db.reports.update_one({"report_id": report_id},
        {"$set": {"status": "Assigned", "assigned_driver_id": str(driver["_id"]),
                  "assigned_unit": driver.get("vehicle_id", driver["name"]), "updated_at": now},
         "$push": {"timeline": entry}})
    if result.matched_count == 0: raise HTTPException(404, "Report not found")
    return {"ok": True, "assigned_to": driver["name"]}


@router.post("/reports/{report_id}/reject")
async def reject_report(report_id: str, reason: str = "Does not meet criteria", current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    now = datetime.now(timezone.utc)
    entry = {"status": "Rejected", "message": f"Rejected: {reason}", "timestamp": now}
    result = await db.reports.update_one({"report_id": report_id},
        {"$set": {"status": "Rejected", "updated_at": now}, "$push": {"timeline": entry}})
    if result.matched_count == 0: raise HTTPException(404, "Report not found")
    return {"ok": True}


# ── CITIZENS ─────────────────────────────────────────────────────────────────

@router.get("/citizens")
async def list_citizens(current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    result = []
    async for u in db.users.find({"role": "citizen"}):
        rc = await db.reports.count_documents({"user_id": str(u["_id"])})
        result.append({"id": str(u["_id"]), "name": u["name"], "email": u["email"],
                       "phone": u.get("phone",""), "location": u.get("location",""),
                       "points": u.get("points",0), "report_count": rc})
    return result


class CitizenCreate(BaseModel):
    name: str; email: EmailStr; password: str
    phone: Optional[str] = None; location: Optional[str] = None

@router.post("/citizens")
async def create_citizen(data: CitizenCreate, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")
    doc = {"name": data.name, "email": data.email, "phone": data.phone,
           "location": data.location, "hashed_password": hash_password(data.password),
           "role": "citizen", "points": 0, "level": 1, "streak": 0,
           "created_at": datetime.now(timezone.utc)}
    result = await db.users.insert_one(doc)
    return {"id": str(result.inserted_id), "name": data.name, "email": data.email}


class CitizenUpdate(BaseModel):
    name: Optional[str] = None; phone: Optional[str] = None; location: Optional[str] = None

@router.put("/citizens/{citizen_id}")
async def update_citizen(citizen_id: str, data: CitizenUpdate, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates: raise HTTPException(400, "Nothing to update")
    result = await db.users.update_one({"_id": ObjectId(citizen_id), "role": "citizen"}, {"$set": updates})
    if result.matched_count == 0: raise HTTPException(404, "Citizen not found")
    return {"ok": True}


@router.delete("/citizens/{citizen_id}")
async def delete_citizen(citizen_id: str, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(citizen_id), "role": "citizen"})
    if not user: raise HTTPException(404, "Citizen not found")
    await db.users.delete_one({"_id": ObjectId(citizen_id)})
    await db.reports.delete_many({"user_id": citizen_id})
    return {"ok": True}


# ── DRIVERS ──────────────────────────────────────────────────────────────────

@router.get("/drivers")
async def list_drivers(current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    result = []
    async for u in db.users.find({"role": "driver"}):
        assigned = await db.reports.count_documents(
            {"assigned_driver_id": str(u["_id"]), "status": {"$in": ["Assigned","In Progress"]}})
        result.append({"id": str(u["_id"]), "name": u["name"], "email": u["email"],
                       "vehicle_id": u.get("vehicle_id"), "phone": u.get("phone"), "active_tasks": assigned})
    return result


class DriverCreate(BaseModel):
    name: str; email: EmailStr; password: str
    phone: Optional[str] = None; vehicle_id: Optional[str] = None

@router.post("/drivers")
async def create_driver(data: DriverCreate, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(400, "Email already registered")
    doc = {"name": data.name, "email": data.email, "phone": data.phone,
           "vehicle_id": data.vehicle_id, "hashed_password": hash_password(data.password),
           "role": "driver", "points": 0, "level": 1, "streak": 0,
           "created_at": datetime.now(timezone.utc)}
    result = await db.users.insert_one(doc)
    return {"id": str(result.inserted_id), "name": data.name, "email": data.email}


class DriverUpdate(BaseModel):
    name: Optional[str] = None; phone: Optional[str] = None; vehicle_id: Optional[str] = None

@router.put("/drivers/{driver_id}")
async def update_driver(driver_id: str, data: DriverUpdate, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    if not updates: raise HTTPException(400, "Nothing to update")
    result = await db.users.update_one({"_id": ObjectId(driver_id), "role": "driver"}, {"$set": updates})
    if result.matched_count == 0: raise HTTPException(404, "Driver not found")
    return {"ok": True}


@router.delete("/drivers/{driver_id}")
async def delete_driver(driver_id: str, current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(driver_id), "role": "driver"})
    if not user: raise HTTPException(404, "Driver not found")
    await db.users.delete_one({"_id": ObjectId(driver_id)})
    return {"ok": True}
