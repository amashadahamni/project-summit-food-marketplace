from fastapi import Depends, FastAPI, HTTPException, Response, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import CartItem
from .schemas import CartItemRequest, CartResponse
from .security import Principal, current_customer
from .services import add_or_update_item, get_or_create_active_cart


Base.metadata.create_all(bind=engine)
app = FastAPI(title="Summit Cart Service", version="1.0.0")


@app.get("/carts/me", response_model=CartResponse, tags=["carts"])
def get_my_cart(customer: Principal = Depends(current_customer), database: Session = Depends(get_db)):
    return get_or_create_active_cart(database, customer.subject)


@app.put("/carts/me/items", response_model=CartResponse, tags=["carts"])
def set_cart_item(payload: CartItemRequest, customer: Principal = Depends(current_customer), database: Session = Depends(get_db)):
    return add_or_update_item(database, customer.subject, payload)


@app.delete("/carts/me/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["carts"])
def remove_cart_item(product_id: int, customer: Principal = Depends(current_customer), database: Session = Depends(get_db)):
    cart = get_or_create_active_cart(database, customer.subject)
    item = database.query(CartItem).filter_by(cart_id=cart.id, product_id=product_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Cart item not found")
    database.delete(item)
    database.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/health", tags=["operations"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready", tags=["operations"])
def ready() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ready"}