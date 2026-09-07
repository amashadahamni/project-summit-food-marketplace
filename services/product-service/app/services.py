from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Product, ProductAuditEvent
from .schemas import ProductCreate, ProductUpdate
from .security import Principal


def seed_demo_products(database: Session) -> None:
    catalog = [
        ("Free-range Chicken", "Meats", "8.99", "Locally raised free-range chicken portions for everyday meals.", 42, "Hilltop Poultry"),
        ("Atlantic Salmon Fillet", "Seafood", "14.50", "Responsibly sourced salmon fillet, trimmed and ready to cook.", 18, "Coastal Catch"),
        ("Honeycrisp Apples", "Fruit", "4.25", "Crisp, sweet apples harvested from a nearby family orchard.", 80, "Green Valley Orchard"),
        ("Farmhouse Eggs", "Dairy", "5.75", "Fresh free-range eggs packed by a local family farm.", 60, "Sunrise Farm"),
        ("Heirloom Tomatoes", "Vegetables", "3.90", "Vine-ripened heirloom tomatoes with full seasonal flavor.", 35, "Riverbend Growers"),
        ("Stoneground Oat Flour", "Pantry", "6.40", "Wholegrain oat flour milled in small batches for baking.", 25, "Mill House Foods"),
        ("Avocados", "Fruit", "5.20", "Creamy ripe avocados selected for salads and toast.", 40, "Green Valley Orchard"),
        ("Bananas", "Fruit", "2.60", "Naturally sweet bananas for snacks and smoothies.", 95, "Tropical Harvest"),
        ("Strawberries", "Fruit", "4.80", "Juicy strawberries picked at peak freshness.", 28, "Berry Patch Farm"),
        ("Blueberries", "Fruit", "5.10", "Plump blueberries with bright summer flavor.", 30, "Berry Patch Farm"),
        ("Navel Oranges", "Fruit", "3.70", "Seedless oranges rich in sweet citrus flavor.", 72, "Citrus Grove"),
        ("Broccoli", "Vegetables", "2.90", "Fresh green broccoli crowns for roasting or steaming.", 48, "Riverbend Growers"),
        ("Baby Spinach", "Vegetables", "3.40", "Tender washed spinach leaves ready for salads.", 33, "Garden Table"),
        ("Carrots", "Vegetables", "2.30", "Crunchy sweet carrots grown in rich soil.", 70, "Riverbend Growers"),
        ("Sweet Potatoes", "Vegetables", "3.10", "Naturally sweet potatoes for comforting meals.", 55, "Harvest Roots"),
        ("Red Bell Peppers", "Vegetables", "4.40", "Crisp red peppers with a mild sweet taste.", 38, "Garden Table"),
        ("Whole Milk", "Dairy", "3.85", "Fresh pasteurized whole milk from local dairy cows.", 44, "Sunrise Farm"),
        ("Greek Yogurt", "Dairy", "4.95", "Thick plain Greek yogurt with a creamy finish.", 36, "Sunrise Farm"),
        ("Cheddar Cheese", "Dairy", "6.75", "Mature cheddar cheese with a rich savory flavor.", 22, "Meadow Dairy"),
        ("Salted Butter", "Dairy", "4.60", "Traditional churned butter made with fresh cream.", 31, "Meadow Dairy"),
        ("Beef Mince", "Meats", "9.80", "Lean beef mince from carefully raised cattle.", 26, "Pasture Fields"),
        ("Lamb Chops", "Meats", "15.25", "Tender lamb chops cut by local butchers.", 16, "Pasture Fields"),
        ("Turkey Breast", "Meats", "10.40", "Lean turkey breast slices for easy family meals.", 24, "Hilltop Poultry"),
        ("Pork Sausages", "Meats", "7.30", "Herb-seasoned pork sausages made in small batches.", 34, "Village Butchery"),
        ("Prawns", "Seafood", "12.90", "Peeled prawns frozen quickly to preserve freshness.", 20, "Coastal Catch"),
        ("Cod Loins", "Seafood", "13.40", "Flaky cod loins ready for baking or pan frying.", 19, "Coastal Catch"),
        ("Tuna Steaks", "Seafood", "16.80", "Premium tuna steaks with a firm meaty texture.", 12, "Ocean Select"),
        ("Dark Chocolate", "Chocolates", "3.50", "Rich dark chocolate with a smooth cocoa finish.", 50, "Cocoa Craft"),
        ("Milk Chocolate Bar", "Chocolates", "3.20", "Creamy milk chocolate made with cocoa and milk.", 56, "Cocoa Craft"),
        ("Chocolate Truffles", "Chocolates", "7.90", "Hand-finished cocoa truffles for a special treat.", 18, "Sweet Atelier"),
        ("Sparkling Water", "Drinks", "1.85", "Crisp sparkling mineral water in a reusable bottle.", 90, "Spring Source"),
        ("Apple Juice", "Drinks", "3.60", "Pressed apple juice with no added sugar.", 45, "Green Valley Orchard"),
        ("Orange Juice", "Drinks", "3.80", "Bright citrus juice pressed from ripe oranges.", 41, "Citrus Grove"),
        ("Iced Tea", "Drinks", "2.95", "Lightly sweetened black tea served chilled.", 37, "Leaf and Brew"),
        ("Chocolate Chip Cookies", "Biscuits", "4.50", "Crunchy cookies loaded with chocolate chips.", 32, "Baker's Corner"),
        ("Oat Biscuits", "Biscuits", "3.95", "Wholesome oat biscuits for tea time snacks.", 40, "Baker's Corner"),
        ("Ginger Biscuits", "Biscuits", "4.10", "Spiced ginger biscuits with a crisp bite.", 27, "Baker's Corner"),
        ("Sourdough Loaf", "Bakery", "5.40", "Slow-fermented sourdough loaf with a crisp crust.", 21, "Daily Bread"),
        ("Wholemeal Bread", "Bakery", "3.85", "Soft wholemeal bread baked fresh each morning.", 39, "Daily Bread"),
        ("Croissants", "Bakery", "4.95", "Buttery baked croissants for breakfast or brunch.", 17, "Daily Bread"),
        ("Basmati Rice", "Pantry", "5.60", "Fragrant long grain basmati rice for family meals.", 65, "Mill House Foods"),
        ("Pasta Penne", "Pantry", "2.75", "Durum wheat penne pasta for quick dinners.", 58, "Mill House Foods"),
        ("Extra Virgin Olive Oil", "Pantry", "9.90", "Cold-pressed olive oil with a rounded flavor.", 24, "Olive Grove Co"),
        ("Tomato Basil Sauce", "Pantry", "4.20", "Slow-cooked tomato sauce with fragrant basil.", 43, "Kitchen Garden"),
        ("Salted Cashews", "Snacks", "6.25", "Roasted cashews lightly seasoned with sea salt.", 29, "Nut House"),
        ("Hummus", "Snacks", "4.70", "Creamy chickpea hummus with tahini and lemon.", 23, "Kitchen Garden"),
        ("Potato Crisps", "Snacks", "3.15", "Hand-cooked potato crisps with sea salt.", 47, "Crisp Works"),
        ("Ground Coffee", "Coffee and Tea", "8.40", "Medium roast ground coffee with caramel notes.", 36, "Roast House"),
        ("English Breakfast Tea", "Coffee and Tea", "4.35", "Full-bodied black tea bags for daily brewing.", 52, "Leaf and Brew"),
        ("Herbal Tea Collection", "Coffee and Tea", "5.25", "Caffeine-free herbal tea selection with six blends.", 26, "Leaf and Brew"),
    ]
    existing_names = set(database.scalars(select(Product.name).where(Product.supplier_id == "demo-supplier")).all())
    database.add_all([
        Product(name=name, category=category, price=Decimal(price), description=description, stock=stock, producer=producer, supplier_id="demo-supplier", status="approved", active=True)
        for name, category, price, description, stock, producer in catalog
        if name not in existing_names
    ])
    database.commit()


def customer_products(database: Session, search: str | None, category: str | None, minimum_price: Decimal | None = None, maximum_price: Decimal | None = None, in_stock: bool = False) -> list[Product]:
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