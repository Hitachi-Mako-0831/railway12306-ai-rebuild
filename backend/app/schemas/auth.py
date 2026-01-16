from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    username: str
    password: str
    id_last4: str | None = None
    sms_code: str | None = None


class RegisterRequest(BaseModel):
    username: str
    password: str
    confirm_password: str
    real_name: str
    id_type: str
    id_number: str
    user_type: str
    phone: str
    email: EmailStr


class LoginVerifyCodeRequest(BaseModel):
    username: str
    id_last4: str

