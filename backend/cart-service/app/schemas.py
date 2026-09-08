from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CartItemRequest(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=1_000_000)


class CartItemResponse(CartItemRequest):
    model_config = ConfigDict(from_attributes=True)
    id: int


class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    customer_id: str
    status: str
    items: list[CartItemResponse]
    created_at: datetime
    updated_at: datetime