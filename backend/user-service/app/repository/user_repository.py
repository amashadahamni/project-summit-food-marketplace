from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import CustomerReview, UserProfile


class UserRepository:
    def __init__(self, database: Session):
        self.database = database

    def find_profile(self, subject: str) -> UserProfile | None:
        return self.database.get(UserProfile, subject)

    def create_profile(self, subject: str, email: str | None) -> UserProfile:
        profile = UserProfile(cognito_subject=subject, email=email)
        self.database.add(profile)
        self.database.commit()
        self.database.refresh(profile)
        return profile

    def save_profile(self, profile: UserProfile) -> UserProfile:
        self.database.commit()
        self.database.refresh(profile)
        return profile

    def create_review(self, subject: str, rating: int, comment: str) -> CustomerReview:
        review = CustomerReview(customer_subject=subject, rating=rating, comment=comment)
        self.database.add(review)
        self.database.commit()
        self.database.refresh(review)
        return review

    def find_reviews(self, subject: str) -> list[CustomerReview]:
        query = select(CustomerReview).where(CustomerReview.customer_subject == subject).order_by(CustomerReview.created_at.desc())
        return list(self.database.scalars(query).all())