from pydantic import BaseModel


class PasswordRecoveryRequest(BaseModel):
    account: str

