from fastapi import HTTPException

from app.services import require_available_stock


def test_cart_quantity_cannot_exceed_available_stock():
    product = {"name": "Farmhouse Eggs", "stock": 102}

    try:
        require_available_stock(product, requested_quantity=103)
    except HTTPException as error:
        assert error.status_code == 422
        assert error.detail == "Stock unavailable. Only 102 units of Farmhouse Eggs are available."
    else:
        raise AssertionError("Expected an unavailable-stock error")


if __name__ == "__main__":
    test_cart_quantity_cannot_exceed_available_stock()