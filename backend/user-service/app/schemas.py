from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserProfileUpdate(BaseModel):
    display_name: str | None = Field(default=None, min_length=2, max_length=160)


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cognito_subject: str
    email: str | None
    display_name: str | None
    roles: list[str]
    created_at: datetime
    updated_at: datetime


class CustomerReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=2, max_length=1000)


class CustomerReviewResponse(CustomerReviewCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime