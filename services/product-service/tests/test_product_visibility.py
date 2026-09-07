from app.database import Base, SessionLocal, engine
from app.models import Product
from app.services import customer_products


def test_customer_results_exclude_pending_rejected_and_inactive_products():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    database = SessionLocal()
    try:
        database.add_all(
            [
                Product(name="Visible Apples", category="Fruit", price=4.50, description="Fresh local apples", stock=10, producer="Summit Farm", supplier_id="supplier-1", status="approved", active=True),
                Product(name="Pending Pears", category="Fruit", price=3.00, description="Fresh local pears", stock=10, producer="Summit Farm", supplier_id="supplier-1", status="pending", active=True),
                Product(name="Inactive Plums", category="Fruit", price=5.00, description="Fresh local plums", stock=10, producer="Summit Farm", supplier_id="supplier-1", status="approved", active=False),
            ]
        )
        database.commit()

        products = customer_products(database, search=None, category="Fruit")

        assert [product.name for product in products] == ["Visible Apples"]
    finally:
        database.close()