import os
from dataclasses import dataclass

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class Principal:
    subject: str
    email: str | None
    roles: set[str]


def current_principal(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> Principal:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication is required")
    region, pool_id, client_id = (os.getenv("COGNITO_REGION"), os.getenv("COGNITO_USER_POOL_ID"), os.getenv("COGNITO_CLIENT_ID"))
    if not all((region, pool_id, client_id)):
        raise HTTPException(status_code=503, detail="Identity configuration is unavailable")
    issuer = f"https://cognito-idp.{region}.amazonaws.com/{pool_id}"
    try:
        key = PyJWKClient(f"{issuer}/.well-known/jwks.json").get_signing_key_from_jwt(credentials.credentials)
        claims = jwt.decode(credentials.credentials, key.key, algorithms=["RS256"], issuer=issuer, options={"verify_aud": False})
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=401, detail="Invalid access token") from error
    if claims.get("token_use") != "access" or claims.get("client_id") != client_id:
        raise HTTPException(status_code=401, detail="Invalid access token")
    return Principal(claims["sub"], claims.get("username"), set(claims.get("cognito:groups", [])))