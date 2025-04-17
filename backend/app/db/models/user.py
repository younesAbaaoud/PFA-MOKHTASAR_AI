from app.core.database import Base
from sqlalchemy import Column, Integer, String

class User(Base):
    __tablename__ = "Users"
    id = Column(Integer, primary_key=True)
    username = Column(String(100))
    email = Column(String(70), unique=True)
    password = Column(String(250))