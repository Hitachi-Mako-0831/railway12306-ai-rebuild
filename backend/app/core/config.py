from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Railway 12306"


settings = Settings()

