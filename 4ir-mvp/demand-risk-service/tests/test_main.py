from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_high_risk_recommendation_for_insufficient_stock():
    response = client.post("/demand-risk", json={"product_name": "Strawberries", "current_stock": 5, "lead_time_days": 3, "daily_sales": [8, 9, 7, 8, 10, 9, 8]})
    assert response.status_code == 200
    body = response.json()
    assert body["risk_level"] == "high"
    assert body["recommended_reorder_units"] > 0


def test_zero_demand_does_not_recommend_reorder():
    response = client.post("/demand-risk", json={"product_name": "Seasonal Sauce", "current_stock": 12, "lead_time_days": 5, "daily_sales": [0, 0, 0, 0, 0, 0, 0]})
    assert response.status_code == 200
    assert response.json()["risk_level"] == "no_recent_demand"


def test_invalid_history_is_rejected():
    response = client.post("/demand-risk", json={"product_name": "Apples", "current_stock": 8, "lead_time_days": 2, "daily_sales": [1, -1, 1, 1, 1, 1, 1]})
    assert response.status_code == 422