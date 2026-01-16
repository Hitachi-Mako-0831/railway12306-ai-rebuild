from sqlalchemy import Column, Integer, String

from ..db.base_class import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(30), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    real_name = Column(String(50), nullable=True)
    id_type = Column(String(50), nullable=False)
    id_number = Column(String(50), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=False)
    user_type = Column(String(50), nullable=False)

