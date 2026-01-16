from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://user:password@localhost:5432/railway12306"


engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False, future=True)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

