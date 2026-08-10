from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="Cart Service")

class CartItem(BaseModel):
    product_id: int
    quantity: int

class Cart(BaseModel):
    customer_id: int
    items: List[CartItem] = []

carts: Dict[int, Cart] = {}

@app.get("/carts/{customer_id}", response_model=Cart)
def get_cart(customer_id: int):
    cart = carts.get(customer_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return cart

@app.post("/carts", response_model=Cart)
def create_or_update_cart(cart: Cart):
    carts[cart.customer_id] = cart
    return cart

@app.delete("/carts/{customer_id}/items/{product_id}", response_model=Cart)
def remove_item(customer_id: int, product_id: int):
    cart = carts.get(customer_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    cart.items = [item for item in cart.items if item.product_id != product_id]
    carts[customer_id] = cart
    return cart
