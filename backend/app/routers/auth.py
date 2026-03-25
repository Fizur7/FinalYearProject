"""
POST /api/auth/register        - citizen registration
POST /api/auth/register-driver - admin creates a driver account
POST /api/auth/login           - all roles login here
"""
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from .. import schemas
from ..models import UserInDB
from ..auth import hash_password, verify_password, create_access_token, require_role
from ..database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_response(user: dict, token: str) -> dict:
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user.get("role", "citizen"),
        },
    }


@router.post("/register", response_model=schemas.TokenResponse)
async def register(data: schemas.UserRegister):
    db = get_db()
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = UserInDB(
        name=data.name, email=data.email, phone=data.phone,
        location=data.location, hashed_password=hash_password(data.password),
        role="citizen",
    ).model_dump()
    result = await db.users.insert_one(doc)
    user = await db.users.find_one({"_id": result.inserted_id})
    return _user_response(user, create_access_token(str(result.inserted_id)))


@router.post("/register-driver", response_model=schemas.TokenResponse)
async def register_driver(data: schemas.DriverRegister):
    """Public endpoint — drivers self-register, no auth required."""
    db = get_db()
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = UserInDB(
        name=data.name, email=data.email, phone=data.phone,
        location=data.location, hashed_password=hash_password(data.password),
        role="driver", vehicle_id=data.vehicle_id,
    ).model_dump()
    result = await db.users.insert_one(doc)
    user = await db.users.find_one({"_id": result.inserted_id})
    return _user_response(user, create_access_token(str(result.inserted_id)))


@router.post("/login", response_model=schemas.TokenResponse)
async def login(data: schemas.UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return _user_response(user, create_access_token(str(user["_id"])))


@router.get("/drivers", response_model=list[schemas.DriverInfo])
async def list_drivers(current_user: dict = Depends(require_role("admin"))):
    db = get_db()
    cursor = db.users.find({"role": "driver"})
    result = []
    async for u in cursor:
        result.append(schemas.DriverInfo(
            id=str(u["_id"]), name=u["name"], email=u["email"],
            vehicle_id=u.get("vehicle_id"), phone=u.get("phone"),
        ))
    return result
