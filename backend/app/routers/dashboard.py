"""
GET /api/dashboard/stats
GET /api/dashboard/waste-distribution
GET /api/dashboard/recent-reports
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from .. import schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
async def get_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    total = await db.reports.count_documents({})
    pending = await db.reports.count_documents({"status": "Pending"})

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today = await db.reports.count_documents({
        "status": "Completed",
        "updated_at": {"$gte": today_start},
    })

    return schemas.DashboardStats(
        total_reports=total,
        pending_reports=pending,
        completed_today=completed_today,
        avg_response_time=28.4,
        active_units=3,
    )


@router.get("/waste-distribution")
async def waste_distribution(current_user: dict = Depends(get_current_user)):
    db = get_db()
    pipeline = [
        {"$group": {"_id": "$waste_type", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    result = []
    async for doc in db.reports.aggregate(pipeline):
        result.append({"type": doc["_id"] or "Unknown", "count": doc["count"]})
    return result


@router.get("/recent-reports", response_model=list[schemas.ReportResponse])
async def recent_reports(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.reports.find({}).sort("created_at", -1).limit(10)
    docs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        docs.append(doc)
    return docs
