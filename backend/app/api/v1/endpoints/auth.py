from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from sqlalchemy import or_

from ....core.security import get_password_hash, verify_password
from ....db.session import SessionLocal
from ....models.user import User
from ....schemas.auth import LoginRequest, RegisterRequest, LoginVerifyCodeRequest
from ....schemas.common import APIResponse
from ....schemas.user import UserProfileResponse


router = APIRouter()


@router.post("/login", response_model=APIResponse)
async def login(payload: LoginRequest) -> JSONResponse:
    db = SessionLocal()
    try:
        identifier = payload.username
        user = (
            db.query(User)
            .filter(
                or_(
                    User.username == identifier,
                    User.email == identifier,
                    User.phone == identifier,
                )
            )
            .first()
        )
        if user is None or not verify_password(payload.password, user.hashed_password):
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "code": 40010,
                    "message": "用户名或密码错误",
                    "data": None,
                },
            )
        profile = UserProfileResponse(
            username=user.username,
            real_name=user.real_name,
            id_type=user.id_type,
            id_number=user.id_number,
            phone=user.phone,
            email=user.email,
            user_type=user.user_type,
        )
        token = f"username:{user.username}"
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "code": 0,
                "message": "ok",
                "data": {
                    "token": token,
                    "user": profile.model_dump(),
                },
            },
        )
    finally:
        db.close()


@router.post("/register", response_model=APIResponse)
async def register(payload: RegisterRequest) -> JSONResponse:
    if payload.password != payload.confirm_password:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "code": 40000,
                "message": "两次输入的密码不一致",
                "data": None,
            },
        )
    db = SessionLocal()
    try:
        existing_by_username = (
            db.query(User).filter(User.username == payload.username).first()
        )
        if existing_by_username is not None:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "code": 40001,
                    "message": "用户名已存在",
                    "data": None,
                },
            )
        existing_by_id_number = (
            db.query(User).filter(User.id_number == payload.id_number).first()
        )
        if existing_by_id_number is not None:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "code": 40002,
                    "message": "证件号码已存在",
                    "data": None,
                },
            )
        hashed_password = get_password_hash(payload.password)
        user = User(
            username=payload.username,
            hashed_password=hashed_password,
            real_name=payload.real_name,
            id_type=payload.id_type,
            id_number=payload.id_number,
            phone=payload.phone,
            email=payload.email,
            user_type=payload.user_type,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        profile = UserProfileResponse(
            username=user.username,
            real_name=user.real_name,
            id_type=user.id_type,
            id_number=user.id_number,
            phone=user.phone,
            email=user.email,
            user_type=user.user_type,
        )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "code": 0,
                "message": "ok",
                "data": profile.model_dump(),
            },
        )
    finally:
        db.close()


@router.post("/login/verify-code", response_model=APIResponse)
async def send_login_verify_code(payload: LoginVerifyCodeRequest) -> JSONResponse:
    db = SessionLocal()
    try:
        user = (
            db.query(User)
            .filter(
                or_(
                    User.username == payload.username,
                    User.phone == payload.username,
                )
            )
            .first()
        )
        if user is None:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "code": 40020,
                    "message": "用户不存在",
                    "data": None,
                },
            )
        if not user.id_number.endswith(payload.id_last4):
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "code": 40021,
                    "message": "证件号后四位不匹配",
                    "data": None,
                },
            )
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={
                "code": 0,
                "message": "验证码已发送",
                "data": {"account": payload.username},
            },
        )
    finally:
        db.close()
