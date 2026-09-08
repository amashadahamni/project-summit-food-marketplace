from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category: str = Field(min_length=2, max_length=80)
    price: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    description: str = Field(min_length=10, max_length=3000)
    stock: int = Field(ge=0, le=1_000_000)
    producer: str = Field(min_length=2, max_length=160)


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    category: str | None = Field(default=None, min_length=2, max_length=80)
    price: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    description: str | None = Field(default=None, min_length=10, max_length=3000)
    stock: int | None = Field(default=None, ge=0, le=1_000_000)
    producer: str | None = Field(default=None, min_length=2, max_length=160)
    active: bool | None = None


class RejectionRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


class ProductResponse(ProductCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    supplier_id: str
    status: str
    active: bool
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime


class AuditEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    actor_id: str
    action: str
    reason: str | None
    created_at: datetime