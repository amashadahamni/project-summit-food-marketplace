import os

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from .models import Cart, CartItem
from .schemas import CartItemRequest


def get_or_create_active_cart(database: Session, customer_id: str) -> Cart:
    cart = database.query(Cart).filter_by(customer_id=customer_id, status="active").first()
    if cart is None:
        cart = Cart(customer_id=customer_id)
        database.add(cart)
        database.commit()
        database.refresh(cart)
    return cart


def get_available_product(payload: CartItemRequest) -> dict:
    product_url = f"{os.getenv('PRODUCT_SERVICE_URL', 'http://localhost:8001')}/products/{payload.product_id}"
    try:
        response = httpx.get(product_url, timeout=5.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as error:
        if error.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Product is not available") from error
        raise HTTPException(status_code=503, detail="Product availability could not be confirmed") from error
    except httpx.HTTPError as error:
        raise HTTPException(status_code=503, detail="Product availability could not be confirmed") from error


def require_available_stock(product: dict, requested_quantity: int) -> None:
    available_stock = product.get("stock", 0)
    if available_stock < requested_quantity:
        product_name = product.get("name", "This product")
        raise HTTPException(
            status_code=422,
            detail=f"Stock unavailable. Only {available_stock} units of {product_name} are available."
        )


def add_or_update_item(database: Session, customer_id: str, payload: CartItemRequest) -> Cart:
    product = get_available_product(payload)
    require_available_stock(product, payload.quantity)
    cart = get_or_create_active_cart(database, customer_id)
    item = database.query(CartItem).filter_by(cart_id=cart.id, product_id=payload.product_id).first()
    if item is None:
        database.add(CartItem(cart_id=cart.id, product_id=payload.product_id, quantity=payload.quantity))
    else:
        item.quantity = payload.quantity
    database.commit()
    database.refresh(cart)
    return cart