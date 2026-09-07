from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import get_db
from .models import Product, ProductAuditEvent
from .schemas import AuditEventResponse, ProductCreate, ProductResponse, ProductUpdate, RejectionRequest
from .security import Principal, require_role
from .services import approve_product, create_product, customer_products, reject_product, update_product


router = APIRouter(prefix="/products", tags=["products"])


def product_or_404(product_id: int, database: Session) -> Product:
    product = database.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.get("", response_model=list[ProductResponse])
def list_customer_products(search: str | None = Query(default=None, max_length=160), category: str | None = Query(default=None, max_length=80), minimum_price: Decimal | None = Query(default=None, ge=0), maximum_price: Decimal | None = Query(default=None, ge=0), in_stock: bool = False, database: Session = Depends(get_db)):
    if minimum_price is not None and maximum_price is not None and minimum_price > maximum_price:
        raise HTTPException(status_code=422, detail="Minimum price cannot exceed maximum price")
    return customer_products(database, search, category, minimum_price, maximum_price, in_stock)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def submit_product(payload: ProductCreate, supplier: Principal = Depends(require_role("Supplier")), database: Session = Depends(get_db)):
    return create_product(database, payload, supplier)


@router.patch("/{product_id}", response_model=ProductResponse)
def edit_product(product_id: int, payload: ProductUpdate, supplier: Principal = Depends(require_role("Supplier")), database: Session = Depends(get_db)):
    try:
        return update_product(database, product_or_404(product_id, database), payload, supplier)
    except PermissionError as error:
        raise HTTPException(status_code=403, detail=str(error)) from error


@router.get("/supplier/mine", response_model=list[ProductResponse])
def list_supplier_products(supplier: Principal = Depends(require_role("Supplier")), database: Session = Depends(get_db)):
    return list(database.scalars(select(Product).where(Product.supplier_id == supplier.subject).order_by(Product.updated_at.desc())).all())


@router.get("/review/pending", response_model=list[ProductResponse])
def list_pending_products(steward: Principal = Depends(require_role("DataSteward")), database: Session = Depends(get_db)):
    return list(database.scalars(select(Product).where(Product.status == "pending").order_by(Product.created_at)).all())


@router.put("/{product_id}/approve", response_model=ProductResponse)
def approve(product_id: int, steward: Principal = Depends(require_role("DataSteward")), database: Session = Depends(get_db)):
    return approve_product(database, product_or_404(product_id, database), steward)


@router.put("/{product_id}/reject", response_model=ProductResponse)
def reject(product_id: int, payload: RejectionRequest, steward: Principal = Depends(require_role("DataSteward")), database: Session = Depends(get_db)):
    return reject_product(database, product_or_404(product_id, database), steward, payload.reason)


@router.get("/{product_id}/audit", response_model=list[AuditEventResponse])
def product_audit(product_id: int, steward: Principal = Depends(require_role("DataSteward")), database: Session = Depends(get_db)):
    product_or_404(product_id, database)
    return list(database.scalars(select(ProductAuditEvent).where(ProductAuditEvent.product_id == product_id).order_by(ProductAuditEvent.created_at)).all())


@router.get("/{product_id}", response_model=ProductResponse)
def get_customer_product(product_id: int, database: Session = Depends(get_db)):
    product = product_or_404(product_id, database)
    if product.status != "approved" or not product.active:
        raise HTTPException(status_code=404, detail="Product not found")
    return product