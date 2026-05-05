"""
GET /api/dashboard/stats          - current user's own stats
GET /api/dashboard/waste-distribution - current user's waste breakdown
GET /api/dashboard/recent-reports - current user's recent reports
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from .. import schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    uid = str(current_user["_id"])

    total = await db.reports.count_documents({"user_id": uid})
    pending = await db.reports.count_documents({"user_id": uid, "status": "Pending"})
    assigned = await db.reports.count_documents({"user_id": uid, "status": "Assigned"})
    in_progress = await db.reports.count_documents({"user_id": uid, "status": "In Progress"})
    completed = await db.reports.count_documents({"user_id": uid, "status": "Completed"})

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today = await db.reports.count_documents({
        "user_id": uid,
        "status": "Completed",
        "updated_at": {"$gte": today_start},
    })

    # Reload fresh user for points/level
    from bson import ObjectId
    user = await db.users.find_one({"_id": ObjectId(uid)})
    points = user.get("points", 0) if user else 0
    level = user.get("level", 1) if user else 1

    return {
        "total_reports": total,
        "pending_reports": pending,
        "assigned_reports": assigned,
        "in_progress_reports": in_progress,
        "completed_reports": completed,
        "completed_today": completed_today,
        "points": points,
        "level": level,
    }


@router.get("/waste-distribution")
async def waste_distribution(current_user: dict = Depends(get_current_user)):
    db = get_db()
    uid = str(current_user["_id"])
    pipeline = [
        {"$match": {"user_id": uid}},
        {"$group": {"_id": "$waste_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = []
    async for doc in db.reports.aggregate(pipeline):
        result.append({"type": doc["_id"] or "Unknown", "count": doc["count"]})
    return result


@router.get("/recent-reports")
async def recent_reports(current_user: dict = Depends(get_current_user)):
    db = get_db()
    uid = str(current_user["_id"])
    cursor = db.reports.find({"user_id": uid}).sort("created_at", -1).limit(10)
    docs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        docs.append(doc)
    return docs
