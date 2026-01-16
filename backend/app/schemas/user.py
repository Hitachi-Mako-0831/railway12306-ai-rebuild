from pydantic import BaseModel, EmailStr


class UserProfileBase(BaseModel):
    username: str
    real_name: str | None = None
    id_type: str
    id_number: str
    phone: str
    email: EmailStr
    user_type: str


class UserProfileResponse(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    real_name: str | None = None
    phone: str | None = None
    email: EmailStr | None = None
    user_type: str | None = None

