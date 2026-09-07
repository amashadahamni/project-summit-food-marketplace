from fastapi import FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy import text

from .database import Base, SessionLocal, engine
from .routers import router
from .services import seed_demo_products


Base.metadata.create_all(bind=engine)
with SessionLocal() as database:
    seed_demo_products(database)
app = FastAPI(title="Summit Product Service", version="1.0.0")
app.include_router(router)


@app.get("/health", tags=["operations"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready", tags=["operations"])
def ready() -> JSONResponse:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return JSONResponse({"status": "ready"})
    except Exception:
        return JSONResponse({"status": "unavailable"}, status_code=503)