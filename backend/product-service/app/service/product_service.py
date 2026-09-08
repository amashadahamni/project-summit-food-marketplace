from decimal import Decimal

from ..exceptions import ProductAccessError, ProductNotFoundError, ProductServiceError
from ..models import Product
from ..repository import ProductRepository
from ..schemas import ProductCreate, ProductUpdate
from ..security import Principal


class ProductService:
    def __init__(self, repository: ProductRepository):
        self.repository = repository

    def list_customer_products(self, search: str | None, category: str | None, minimum_price: Decimal | None, maximum_price: Decimal | None, in_stock: bool) -> list[Product]:
        if minimum_price is not None and maximum_price is not None and minimum_price > maximum_price:
            raise ProductServiceError("Minimum price cannot be greater than maximum price.")
        return self.repository.find_customer_products(search, category, minimum_price, maximum_price, in_stock)

    def get_customer_product(self, product_id: int) -> Product:
        product = self._find_product(product_id)
        if product.status != "approved" or not product.active:
            raise ProductNotFoundError()
        return product

    def create_product(self, payload: ProductCreate, supplier: Principal) -> Product:
        product = self.repository.add(Product(**payload.model_dump(), supplier_id=supplier.subject))
        self.repository.add_audit_event(product.id, supplier.subject, "submitted")
        return self.repository.save(product)

    def update_product(self, product_id: int, payload: ProductUpdate, supplier: Principal) -> Product:
        product = self._find_owned_product(product_id, supplier)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(product, field, value)
        product.status = "pending"
        product.rejection_reason = None
        self.repository.add_audit_event(product.id, supplier.subject, "resubmitted")
        return self.repository.save(product)

    def delete_product(self, product_id: int, supplier: Principal) -> None:
        product = self._find_owned_product(product_id, supplier)
        self.repository.deactivate(product)

    def list_supplier_products(self, supplier: Principal) -> list[Product]:
        return self.repository.find_by_supplier(supplier.subject)

    def list_pending_products(self) -> list[Product]:
        return self.repository.find_pending()

    def update_approval(self, product_id: int, action: str, steward: Principal, reason: str | None = None) -> Product:
        product = self._find_product(product_id)
        if action == "approve":
            product.status = "approved"
            product.rejection_reason = None
        elif action == "reject":
            if not reason:
                raise ProductServiceError("Please provide a reason when rejecting a product.")
            product.status = "rejected"
            product.rejection_reason = reason
        else:
            raise ProductServiceError("Choose either approve or reject for the product decision.")
        self.repository.add_audit_event(product.id, steward.subject, action, reason)
        return self.repository.save(product)

    def list_audit_events(self, product_id: int):
        self._find_product(product_id)
        return self.repository.find_audit_events(product_id)

    def _find_product(self, product_id: int) -> Product:
        product = self.repository.find_by_id(product_id)
        if product is None:
            raise ProductNotFoundError()
        return product

    def _find_owned_product(self, product_id: int, supplier: Principal) -> Product:
        product = self._find_product(product_id)
        if product.supplier_id != supplier.subject:
            raise ProductAccessError()
        return product