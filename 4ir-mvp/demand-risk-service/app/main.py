from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, model_validator


class DemandRiskRequest(BaseModel):
    product_name: str = Field(min_length=2, max_length=160)
    current_stock: int = Field(ge=0)
    lead_time_days: int = Field(ge=1, le=28)
    daily_sales: list[int] = Field(min_length=7, max_length=56)

    @model_validator(mode="after")
    def daily_sales_are_non_negative(self):
        if any(value < 0 for value in self.daily_sales):
            raise ValueError("daily_sales values must be non-negative")
        return self


class DemandRiskResponse(BaseModel):
    product_name: str
    forecast_daily_units: float
    forecast_lead_time_units: int
    stock_cover_days: float | None
    risk_level: str
    recommended_reorder_units: int
    explanation: str


def estimate_daily_demand(daily_sales: list[int]) -> float:
    """Use recent demand with a small seven-day seasonal component."""
    recent = daily_sales[-7:]
    previous = daily_sales[-14:-7] if len(daily_sales) >= 14 else recent
    recent_average = sum(recent) / len(recent)
    previous_average = sum(previous) / len(previous)
    return round((recent_average * 0.7) + (previous_average * 0.3), 2)


def assess_demand_risk(request: DemandRiskRequest) -> DemandRiskResponse:
    forecast_daily_units = estimate_daily_demand(request.daily_sales)
    if forecast_daily_units == 0:
        return DemandRiskResponse(
            product_name=request.product_name,
            forecast_daily_units=0,
            forecast_lead_time_units=0,
            stock_cover_days=None,
            risk_level="no_recent_demand",
            recommended_reorder_units=0,
            explanation="No units sold in the supplied history; no reorder is recommended.",
        )
    forecast_lead_time_units = round(forecast_daily_units * request.lead_time_days)
    safety_stock = round(forecast_daily_units * 2)
    reorder_point = forecast_lead_time_units + safety_stock
    stock_cover_days = round(request.current_stock / forecast_daily_units, 1)
    risk_level = "high" if request.current_stock < forecast_lead_time_units else "medium" if request.current_stock < reorder_point else "low"
    return DemandRiskResponse(
        product_name=request.product_name,
        forecast_daily_units=forecast_daily_units,
        forecast_lead_time_units=forecast_lead_time_units,
        stock_cover_days=stock_cover_days,
        risk_level=risk_level,
        recommended_reorder_units=max(0, reorder_point - request.current_stock),
        explanation=f"Forecast uses the most recent 7 days (70%) and prior 7 days (30%); reorder point includes {safety_stock} units of safety stock.",
    )


app = FastAPI(title="Summit Demand Risk MVP", version="1.0.0")


@app.get("/health", tags=["operations"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/demand-risk", response_model=DemandRiskResponse, tags=["decision-support"])
def demand_risk(request: DemandRiskRequest) -> DemandRiskResponse:
    try:
        return assess_demand_risk(request)
    except (ArithmeticError, ValueError) as error:
        raise HTTPException(status_code=422, detail="Demand risk could not be calculated") from error