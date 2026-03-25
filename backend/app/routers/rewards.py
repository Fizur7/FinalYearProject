"""
GET  /api/rewards/
POST /api/rewards/{id}/redeem
GET  /api/rewards/leaderboard
GET  /api/rewards/my-stats
"""
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from .. import schemas
from ..auth import get_current_user
from ..database import get_db

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


@router.get("/leaderboard", response_model=list[schemas.LeaderboardEntry])
async def leaderboard(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.users.find({}).sort("points", -1).limit(10)
    result = []
    rank = 1
    async for user in cursor:
        report_count = await db.reports.count_documents({"user_id": str(user["_id"])})
        result.append(schemas.LeaderboardEntry(
            rank=rank, name=user["name"], points=user["points"], reports=report_count
        ))
        rank += 1
    return result


@router.get("/my-stats", response_model=schemas.UserStats)
async def my_stats(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_points = current_user.get("points", 0)
    rank = await db.users.count_documents({"points": {"$gt": user_points}}) + 1
    total_reports = await db.reports.count_documents({"user_id": str(current_user["_id"])})
    return schemas.UserStats(
        name=current_user["name"],
        rank=rank,
        points=user_points,
        total_reports=total_reports,
        level=current_user.get("level", 1),
        streak=current_user.get("streak", 0),
    )


@router.get("/", response_model=list[schemas.RewardItem])
async def list_rewards(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db.rewards.find({})
    result = []
    async for r in cursor:
        result.append(schemas.RewardItem(
            id=str(r["_id"]), name=r["name"],
            points_cost=r["points_cost"], icon=r["icon"], available=r["available"]
        ))
    return result


@router.post("/{reward_id}/redeem")
async def redeem_reward(reward_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    reward = await db.rewards.find_one({"_id": ObjectId(reward_id)})
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    if not reward["available"]:
        raise HTTPException(status_code=400, detail="Reward not available")
    if current_user.get("points", 0) < reward["points_cost"]:
        raise HTTPException(status_code=400, detail="Insufficient points")
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"points": -reward["points_cost"]}},
    )
    return {"ok": True}
