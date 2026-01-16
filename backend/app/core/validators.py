from pydantic import BaseModel, EmailStr, field_validator


class PhoneNumberModel(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("Invalid phone number")
        return value


class EmailModel(BaseModel):
    email: EmailStr

