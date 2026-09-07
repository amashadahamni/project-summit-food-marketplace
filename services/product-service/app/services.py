from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Product, ProductAuditEvent
from .schemas import ProductCreate, ProductUpdate
from .security import Principal


def customer_products(database: Session, search: str | None, category: str | None) -> list[Product]:
    query = select(Product).where(Product.status == "approved", Product.active.is_(True))
    if search:
        query = query.where(Product.name.ilike(f"%{search.strip()}%"))
    if category:
        query = query.where(Product.category.ilike(category.strip()))
    return list(database.scalars(query.order_by(Product.name)).all())


def create_product(database: Session, payload: ProductCreate, supplier: Principal) -> Product:
    product = Product(**payload.model_dump(), supplier_id=supplier.subject)
    database.add(product)
    database.flush()
    audit(database, product.id, supplier.subject, "submitted")
    database.commit()
    database.refresh(product)
    return product


def update_product(database: Session, product: Product, payload: ProductUpdate, supplier: Principal) -> Product:
    if product.supplier_id != supplier.subject:
        raise PermissionError("A supplier may modify only their own products")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    product.status = "pending"
    product.rejection_reason = None
    audit(database, product.id, supplier.subject, "resubmitted")
    database.commit()
    database.refresh(product)
    return product


def approve_product(database: Session, product: Product, steward: Principal) -> Product:
    product.status = "approved"
    product.rejection_reason = None
    audit(database, product.id, steward.subject, "approved")
    database.commit()
    database.refresh(product)
    return product


def reject_product(database: Session, product: Product, steward: Principal, reason: str) -> Product:
    product.status = "rejected"
    product.rejection_reason = reason
    audit(database, product.id, steward.subject, "rejected", reason)
    database.commit()
    database.refresh(product)
    return product


def audit(database: Session, product_id: int, actor_id: str, action: str, reason: str | None = None) -> None:
    database.add(ProductAuditEvent(product_id=product_id, actor_id=actor_id, action=action, reason=reason))