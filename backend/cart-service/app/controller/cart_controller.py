from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..repository import CartRepository
from ..schemas import CartItemRequest, CartResponse
from ..security import Principal, current_customer
from ..service import CartService


router = APIRouter(prefix="/carts", tags=["carts"])


def get_cart_service(database: Session = Depends(get_db)) -> CartService:
    return CartService(CartRepository(database))


@router.get("/me", response_model=CartResponse)
def get_my_cart(customer: Principal = Depends(current_customer), service: CartService = Depends(get_cart_service)):
    return service.get_cart(customer.subject)


@router.put("/me/items", response_model=CartResponse)
def set_cart_item(payload: CartItemRequest, customer: Principal = Depends(current_customer), service: CartService = Depends(get_cart_service)):
    return service.set_item(customer.subject, payload)


@router.delete("/me/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_cart_item(product_id: int, customer: Principal = Depends(current_customer), service: CartService = Depends(get_cart_service)) -> Response:
    service.remove_item(customer.subject, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)