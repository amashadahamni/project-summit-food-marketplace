from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..repository import UserRepository
from ..schemas import CustomerReviewCreate, CustomerReviewResponse, UserProfileResponse, UserProfileUpdate
from ..security import Principal, current_principal
from ..service import UserService


router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(database: Session = Depends(get_db)) -> UserService:
    return UserService(UserRepository(database))


def profile_response(profile, principal: Principal) -> dict:
    return {"cognito_subject": profile.cognito_subject, "email": profile.email, "display_name": profile.display_name, "roles": sorted(principal.roles), "created_at": profile.created_at, "updated_at": profile.updated_at}


@router.get("/me", response_model=UserProfileResponse)
def my_profile(principal: Principal = Depends(current_principal), service: UserService = Depends(get_user_service)):
    return profile_response(service.get_profile(principal), principal)


@router.patch("/me", response_model=UserProfileResponse)
def edit_my_profile(payload: UserProfileUpdate, principal: Principal = Depends(current_principal), service: UserService = Depends(get_user_service)):
    return profile_response(service.update_profile(principal, payload), principal)


@router.get("/me/reviews", response_model=list[CustomerReviewResponse], tags=["reviews"])
def my_reviews(principal: Principal = Depends(current_principal), service: UserService = Depends(get_user_service)):
    return service.list_reviews(principal)


@router.post("/me/reviews", response_model=CustomerReviewResponse, status_code=status.HTTP_201_CREATED, tags=["reviews"])
def add_review(payload: CustomerReviewCreate, principal: Principal = Depends(current_principal), service: UserService = Depends(get_user_service)):
    return service.create_review(principal, payload.rating, payload.comment)