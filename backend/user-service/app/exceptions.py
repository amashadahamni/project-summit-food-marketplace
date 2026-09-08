import logging

from fastapi import Request
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


class UserServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


async def user_service_error_handler(request: Request, error: UserServiceError) -> JSONResponse:
    logger.warning("User request failed: %s", error.message)
    return JSONResponse(status_code=error.status_code, content={"detail": error.message})


async def unexpected_error_handler(request: Request, error: Exception) -> JSONResponse:
    logger.exception("Unexpected user service error")
    return JSONResponse(status_code=500, content={"detail": "We could not complete your request. Please try again."})