from sqlalchemy.orm import Session

from .models import CustomerReview, UserProfile
from .schemas import UserProfileUpdate
from .security import Principal


def get_or_create_profile(database: Session, principal: Principal) -> UserProfile:
    profile = database.get(UserProfile, principal.subject)
    if profile is None:
        profile = UserProfile(cognito_subject=principal.subject, email=principal.email)
        database.add(profile)
        database.commit()
        database.refresh(profile)
    return profile


def update_profile(database: Session, principal: Principal, payload: UserProfileUpdate) -> UserProfile:
    profile = get_or_create_profile(database, principal)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    database.commit()
    database.refresh(profile)
    return profile


def create_review(database: Session, principal: Principal, rating: int, comment: str) -> CustomerReview:
    get_or_create_profile(database, principal)
    review = CustomerReview(customer_subject=principal.subject, rating=rating, comment=comment.strip())
    database.add(review)
    database.commit()
    database.refresh(review)
    return review


def customer_reviews(database: Session, principal: Principal) -> list[CustomerReview]:
    return list(database.query(CustomerReview).filter_by(customer_subject=principal.subject).order_by(CustomerReview.created_at.desc()).all())