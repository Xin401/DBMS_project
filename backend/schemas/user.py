from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator, HttpUrl

class User(BaseModel):
    userId: str
    name: str
    account: str
    password: str
    profilePicUrl: Optional[str]

    class Config:
        orm_mode = True

    