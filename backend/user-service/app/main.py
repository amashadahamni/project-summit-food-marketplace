from fastapi import FastAPI
from sqlalchemy import text

from .controller import router
from .database import Base, engine
from .exceptions import UserServiceError, unexpected_error_handler, user_service_error_handler


Base.metadata.create_all(bind=engine)
app = FastAPI(title="Summit User Service", version="1.0.0")
app.add_exception_handler(UserServiceError, user_service_error_handler)
app.add_exception_handler(Exception, unexpected_error_handler)
app.include_router(router)


@app.get("/health", tags=["operations"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready", tags=["operations"])
def ready() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ready"}