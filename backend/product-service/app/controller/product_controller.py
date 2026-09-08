from decimal import Decimal

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..repository import ProductRepository
from ..schemas import AuditEventResponse, ProductCreate, ProductResponse, ProductUpdate, RejectionRequest
from ..security import Principal, require_role
from ..service import ProductService


router = APIRouter(prefix="/products", tags=["products"])


def get_product_service(database: Session = Depends(get_db)) -> ProductService:
    return ProductService(ProductRepository(database))


@router.get("", response_model=list[ProductResponse])
def list_customer_products(search: str | None = None, category: str | None = None, minimum_price: Decimal | None = None, maximum_price: Decimal | None = None, in_stock: bool = False, service: ProductService = Depends(get_product_service)):
    return service.list_customer_products(search, category, minimum_price, maximum_price, in_stock)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, supplier: Principal = Depends(require_role("Supplier")), service: ProductService = Depends(get_product_service)):
    return service.create_product(payload, supplier)


@router.get("/supplier/mine", response_model=list[ProductResponse])
def list_supplier_products(supplier: Principal = Depends(require_role("Supplier")), service: ProductService = Depends(get_product_service)):
    return service.list_supplier_products(supplier)


@router.get("/review/pending", response_model=list[ProductResponse])
def list_pending_products(steward: Principal = Depends(require_role("DataSteward")), service: ProductService = Depends(get_product_service)):
    return service.list_pending_products()


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, payload: ProductUpdate, supplier: Principal = Depends(require_role("Supplier")), service: ProductService = Depends(get_product_service)):
    return service.update_product(product_id, payload, supplier)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, supplier: Principal = Depends(require_role("Supplier")), service: ProductService = Depends(get_product_service)) -> Response:
    service.delete_product(product_id, supplier)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch("/{product_id}/approval", response_model=ProductResponse)
def update_approval(product_id: int, payload: RejectionRequest | None = None, action: str = "approve", steward: Principal = Depends(require_role("DataSteward")), service: ProductService = Depends(get_product_service)):
    return service.update_approval(product_id, action, steward, payload.reason if payload else None)


@router.get("/{product_id}/audit", response_model=list[AuditEventResponse])
def list_audit_events(product_id: int, steward: Principal = Depends(require_role("DataSteward")), service: ProductService = Depends(get_product_service)):
    return service.list_audit_events(product_id)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int, service: ProductService = Depends(get_product_service)):
    return service.get_customer_product(product_id)