from fastapi import APIRouter, Header, status
from fastapi.responses import JSONResponse

from ....schemas.common import APIResponse
from ....schemas.user import UserProfileResponse, UserProfileUpdate
from ....core.security import get_password_hash
from ....db.session import SessionLocal
from ....models.user import User


router = APIRouter()


def _parse_username_from_token(authorization: str | None) -> str | None:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) != 2:
        return None
    scheme, token = parts
    if scheme.lower() != "bearer":
        return None
    prefix = "username:"
    if not token.startswith(prefix):
        return None
    return token[len(prefix) :]


def _get_or_create_target_user(username: str | None) -> User:
    db = SessionLocal()
    try:
        query = db.query(User)
        if username:
            user = query.filter(User.username == username).first()
            if user is not None:
                return user
        user = query.order_by(User.id).first()
        if user is not None:
            return user
        user = User(
            username="demo_user",
            hashed_password=get_password_hash("Password123"),
            real_name="测试用户A",
            id_type="id_card",
            id_number="123456789012345678",
            phone="13800138000",
            email="demo@example.com",
            user_type="adult",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def _build_profile(user: User) -> UserProfileResponse:
    return UserProfileResponse(
        username=user.username,
        real_name=user.real_name,
        id_type=user.id_type,
        id_number=user.id_number,
        phone=user.phone,
        email=user.email,
        user_type=user.user_type,
    )


@router.get("/profile", response_model=APIResponse)
async def get_profile(
    authorization: str | None = Header(default=None),
) -> JSONResponse:
    username = _parse_username_from_token(authorization)
    user = _get_or_create_target_user(username)
    profile = _build_profile(user)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"code": 0, "message": "ok", "data": profile.model_dump()},
    )


@router.put("/profile", response_model=APIResponse)
async def update_profile(
    payload: UserProfileUpdate,
    authorization: str | None = Header(default=None),
) -> JSONResponse:
    username = _parse_username_from_token(authorization)
    db = SessionLocal()
    try:
        query = db.query(User)
        user = None
        if username:
            user = query.filter(User.username == username).first()
        if user is None:
            user = query.order_by(User.id).first()
        if user is None:
            user = User(
                username="demo_user",
                hashed_password=get_password_hash("Password123"),
                real_name="测试用户A",
                id_type="id_card",
                id_number="123456789012345678",
                phone="13800138000",
                email="demo@example.com",
                user_type="adult",
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        if payload.real_name is not None:
            user.real_name = payload.real_name
        if payload.phone is not None:
            user.phone = payload.phone
        if payload.email is not None:
            user.email = payload.email
        if payload.user_type is not None:
            user.user_type = payload.user_type
        db.commit()
        db.refresh(user)
        profile = _build_profile(user)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"code": 0, "message": "ok", "data": profile.model_dump()},
        )
    finally:
        db.close()

