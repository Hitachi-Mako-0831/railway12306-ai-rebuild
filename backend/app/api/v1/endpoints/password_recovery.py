from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from ....schemas.common import APIResponse
from ....schemas.password_recovery import PasswordRecoveryRequest


router = APIRouter()


@router.post("/request", response_model=APIResponse)
async def request_password_recovery(
    payload: PasswordRecoveryRequest,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": 0,
            "message": "重置链接已发送",
            "data": {"account": payload.account},
        },
    )
