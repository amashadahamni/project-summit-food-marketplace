from sqlalchemy.orm import Session

from .models import CustomerReview, UserProfile
from .repository import UserRepository
from .schemas import UserProfileUpdate
from .security import Principal
from .service import UserService


def get_or_create_profile(database: Session, principal: Principal) -> UserProfile:
    return UserService(UserRepository(database)).get_profile(principal)


def update_profile(database: Session, principal: Principal, payload: UserProfileUpdate) -> UserProfile:
    return UserService(UserRepository(database)).update_profile(principal, payload)


def create_review(database: Session, principal: Principal, rating: int, comment: str) -> CustomerReview:
    return UserService(UserRepository(database)).create_review(principal, rating, comment)


def customer_reviews(database: Session, principal: Principal) -> list[CustomerReview]:
    return UserService(UserRepository(database)).list_reviews(principal)