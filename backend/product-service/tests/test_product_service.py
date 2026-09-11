from types import SimpleNamespace

import pytest

from app.exceptions import ProductAccessError
from app.security import Principal
from app.service import ProductService


class ProductRepositoryDouble:
    def __init__(self, product):
        self.product = product
        self.events = []

    def find_by_id(self, product_id):
        return self.product if product_id == self.product.id else None

    def add_audit_event(self, product_id, actor_id, action, reason=None):
        self.events.append((product_id, actor_id, action, reason))

    def save(self, product):
        return product

    def deactivate(self, product):
        product.active = False


def test_only_the_submitting_supplier_can_change_a_product():
    product = SimpleNamespace(id=7, supplier_id="supplier-a", active=True)
    service = ProductService(ProductRepositoryDouble(product))

    with pytest.raises(ProductAccessError):
        service.delete_product(7, Principal(subject="supplier-b", roles={"Supplier"}))

    assert product.active is True


def test_supplier_delete_deactivates_and_does_not_remove_the_product():
    product = SimpleNamespace(id=7, supplier_id="supplier-a", active=True)
    repository = ProductRepositoryDouble(product)
    service = ProductService(repository)

    service.delete_product(7, Principal(subject="supplier-a", roles={"Supplier"}))

    assert product.active is False