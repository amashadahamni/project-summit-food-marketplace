import os
from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Principal:
    subject: str
    roles: set[str]


def _verify_token(token: str) -> Principal:
    region = os.getenv("COGNITO_REGION")
    user_pool_id = os.getenv("COGNITO_USER_POOL_ID")
    client_id = os.getenv("COGNITO_CLIENT_ID")
    if not all((region, user_pool_id, client_id)):
        raise HTTPException(status_code=503, detail="Identity configuration is unavailable")

    issuer = f"https://cognito-idp.{region}.amazonaws.com/{user_pool_id}"
    jwks = PyJWKClient(f"{issuer}/.well-known/jwks.json")
    signing_key = jwks.get_signing_key_from_jwt(token)
    claims = jwt.decode(token, signing_key.key, algorithms=["RS256"], issuer=issuer, options={"verify_aud": False})
    if claims.get("token_use") != "access" or claims.get("client_id") != client_id:
        raise HTTPException(status_code=401, detail="Invalid access token")
    return Principal(subject=claims["sub"], roles=set(claims.get("cognito:groups", [])))


def current_principal(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> Principal:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication is required")
    try:
        return _verify_token(credentials.credentials)
    except HTTPException:
        raise
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=401, detail="Invalid access token") from error


def require_role(role: str):
    def dependency(principal: Principal = Depends(current_principal)) -> Principal:
        if role not in principal.roles:
            raise HTTPException(status_code=403, detail="You do not have permission for this action")
        return principal

    return dependency