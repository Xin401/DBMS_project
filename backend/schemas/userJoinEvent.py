from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator, HttpUrl


class UserJoinEvent(BaseModel):
    userId: str
    eventId: str
    isAccepted: Optional[bool]

    class Config:
        orm_mode = True