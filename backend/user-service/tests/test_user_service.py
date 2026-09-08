from types import SimpleNamespace

from app.security import Principal
from app.schemas import UserProfileUpdate
from app.service import UserService


class UserRepositoryDouble:
    def __init__(self):
        self.profile = None

    def find_profile(self, subject):
        return self.profile

    def create_profile(self, subject, email):
        self.profile = SimpleNamespace(cognito_subject=subject, email=email, display_name=None)
        return self.profile

    def save_profile(self, profile):
        return profile

    def create_review(self, subject, rating, comment):
        return SimpleNamespace(customer_subject=subject, rating=rating, comment=comment)

    def find_reviews(self, subject):
        return []


def test_profile_is_created_from_the_authenticated_principal_and_can_be_updated():
    repository = UserRepositoryDouble()
    service = UserService(repository)
    principal = Principal(subject="customer-1", email="customer@example.com", roles={"Customer"})

    profile = service.update_profile(principal, UserProfileUpdate(display_name="Summit Customer"))

    assert profile.cognito_subject == "customer-1"
    assert profile.email == "customer@example.com"
    assert profile.display_name == "Summit Customer"