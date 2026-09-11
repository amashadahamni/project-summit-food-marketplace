from ..models import CustomerReview, UserProfile
from ..repository import UserRepository
from ..schemas import UserProfileUpdate
from ..security import Principal


class UserService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def get_profile(self, principal: Principal) -> UserProfile:
        profile = self.repository.find_profile(principal.subject)
        return profile if profile is not None else self.repository.create_profile(principal.subject, principal.email)

    def update_profile(self, principal: Principal, payload: UserProfileUpdate) -> UserProfile:
        profile = self.get_profile(principal)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
        return self.repository.save_profile(profile)

    def create_review(self, principal: Principal, rating: int, comment: str) -> CustomerReview:
        self.get_profile(principal)
        return self.repository.create_review(principal.subject, rating, comment.strip())

    def list_reviews(self, principal: Principal) -> list[CustomerReview]:
        return self.repository.find_reviews(principal.subject)