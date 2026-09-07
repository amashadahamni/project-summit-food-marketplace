from sqlalchemy.orm import Session

from .models import UserProfile
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