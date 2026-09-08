import logging
import os

import httpx

from ..exceptions import CartServiceError
from ..models import Cart
from ..repository import CartRepository
from ..schemas import CartItemRequest


logger = logging.getLogger(__name__)


class CartService:
    def __init__(self, repository: CartRepository):
        self.repository = repository

    def get_cart(self, customer_id: str) -> Cart:
        return self.repository.find_or_create_active_cart(customer_id)

    def set_item(self, customer_id: str, payload: CartItemRequest) -> Cart:
        product = self._get_available_product(payload.product_id)
        self._require_available_stock(product, payload.quantity)
        return self.repository.set_item_quantity(self.get_cart(customer_id), payload.product_id, payload.quantity)

    def remove_item(self, customer_id: str, product_id: int) -> None:
        item = self.repository.find_item(self.get_cart(customer_id).id, product_id)
        if item is None:
            raise CartServiceError("That item is no longer in your cart.", 404)
        self.repository.remove_item(item)

    def _get_available_product(self, product_id: int) -> dict:
        product_url = f"{os.getenv('PRODUCT_SERVICE_URL', 'http://localhost:8001')}/products/{product_id}"
        try:
            response = httpx.get(product_url, timeout=5.0)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as error:
            logger.info("Product %s cannot be added to a cart: %s", product_id, error.response.status_code)
            if error.response.status_code == 404:
                raise CartServiceError("That product is no longer available.", 404) from error
            raise CartServiceError("We could not confirm product availability. Please try again.", 503) from error
        except httpx.HTTPError as error:
            logger.warning("Product service request failed", exc_info=error)
            raise CartServiceError("We could not confirm product availability. Please try again.", 503) from error

    @staticmethod
    def _require_available_stock(product: dict, requested_quantity: int) -> None:
        available_stock = product.get("stock", 0)
        if available_stock < requested_quantity:
            product_name = product.get("name", "This product")
            raise CartServiceError(f"Stock unavailable. Only {available_stock} units of {product_name} are available.", 422)