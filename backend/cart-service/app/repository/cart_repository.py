from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Cart, CartItem


class CartRepository:
    def __init__(self, database: Session):
        self.database = database

    def find_or_create_active_cart(self, customer_id: str) -> Cart:
        cart = self.database.scalar(select(Cart).where(Cart.customer_id == customer_id, Cart.status == "active"))
        if cart is None:
            cart = Cart(customer_id=customer_id)
            self.database.add(cart)
            self.database.commit()
            self.database.refresh(cart)
        return cart

    def find_item(self, cart_id: int, product_id: int) -> CartItem | None:
        return self.database.scalar(select(CartItem).where(CartItem.cart_id == cart_id, CartItem.product_id == product_id))

    def set_item_quantity(self, cart: Cart, product_id: int, quantity: int) -> Cart:
        item = self.find_item(cart.id, product_id)
        if item is None:
            self.database.add(CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity))
        else:
            item.quantity = quantity
        self.database.commit()
        self.database.refresh(cart)
        return cart

    def remove_item(self, item: CartItem) -> None:
        self.database.delete(item)
        self.database.commit()