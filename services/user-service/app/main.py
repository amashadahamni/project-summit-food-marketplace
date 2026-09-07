from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .schemas import CustomerReviewCreate, CustomerReviewResponse, UserProfileResponse, UserProfileUpdate
from .security import Principal, current_principal
from .services import create_review, customer_reviews, get_or_create_profile, update_profile


Base.metadata.create_all(bind=engine)
app = FastAPI(title="Summit User Service", version="1.0.0")


def response(profile, principal: Principal) -> dict:
    return {"cognito_subject": profile.cognito_subject, "email": profile.email, "display_name": profile.display_name, "roles": sorted(principal.roles), "created_at": profile.created_at, "updated_at": profile.updated_at}


@app.get("/users/me", response_model=UserProfileResponse, tags=["users"])
def my_profile(principal: Principal = Depends(current_principal), database: Session = Depends(get_db)):
    return response(get_or_create_profile(database, principal), principal)


@app.patch("/users/me", response_model=UserProfileResponse, tags=["users"])
def edit_my_profile(payload: UserProfileUpdate, principal: Principal = Depends(current_principal), database: Session = Depends(get_db)):
    return response(update_profile(database, principal, payload), principal)


@app.get("/users/me/reviews", response_model=list[CustomerReviewResponse], tags=["reviews"])
def my_reviews(principal: Principal = Depends(current_principal), database: Session = Depends(get_db)):
    return customer_reviews(database, principal)


@app.post("/users/me/reviews", response_model=CustomerReviewResponse, status_code=201, tags=["reviews"])
def add_review(payload: CustomerReviewCreate, principal: Principal = Depends(current_principal), database: Session = Depends(get_db)):
    return create_review(database, principal, payload.rating, payload.comment)


@app.get("/health", tags=["operations"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/ready", tags=["operations"])
def ready() -> dict[str, str]:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"status": "ready"}