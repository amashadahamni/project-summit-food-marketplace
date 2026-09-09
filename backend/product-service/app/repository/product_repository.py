from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Product, ProductAuditEvent


class ProductRepository:
    def __init__(self, database: Session):
        self.database = database

    def find_customer_products(self, search: str | None, category: str | None, minimum_price: Decimal | None, maximum_price: Decimal | None, in_stock: bool) -> list[Product]:
        query = select(Product).where(Product.status == "approved", Product.active.is_(True))
        if search:
            query = query.where(Product.name.ilike(f"%{search.strip()}%"))
        if category:
            query = query.where(Product.category.ilike(category.strip()))
        if minimum_price is not None:
            query = query.where(Product.price >= minimum_price)
        if maximum_price is not None:
            query = query.where(Product.price <= maximum_price)
        if in_stock:
            query = query.where(Product.stock > 0)
        return list(self.database.scalars(query.order_by(Product.name)).all())

    def find_by_id(self, product_id: int) -> Product | None:
        return self.database.get(Product, product_id)

    def find_by_supplier(self, supplier_id: str) -> list[Product]:
        query = select(Product).where(Product.supplier_id == supplier_id).order_by(Product.updated_at.desc())
        return list(self.database.scalars(query).all())

    def find_pending(self) -> list[Product]:
        query = select(Product).where(Product.status == "pending").order_by(Product.created_at)
        return list(self.database.scalars(query).all())

    def find_review_history(self) -> list[Product]:
        query = select(Product).where(Product.status != "pending").order_by(Product.updated_at.desc())
        return list(self.database.scalars(query).all())

    def find_audit_events(self, product_id: int) -> list[ProductAuditEvent]:
        query = select(ProductAuditEvent).where(ProductAuditEvent.product_id == product_id).order_by(ProductAuditEvent.created_at)
        return list(self.database.scalars(query).all())

    def add(self, product: Product) -> Product:
        self.database.add(product)
        self.database.flush()
        return product

    def add_audit_event(self, product_id: int, actor_id: str, action: str, reason: str | None = None) -> None:
        self.database.add(ProductAuditEvent(product_id=product_id, actor_id=actor_id, action=action, reason=reason))

    def save(self, product: Product) -> Product:
        self.database.commit()
        self.database.refresh(product)
        return product

    def deactivate(self, product: Product) -> None:
        product.active = False
        self.database.commit()