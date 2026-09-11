import logging

from fastapi import Request
from fastapi.responses import JSONResponse


logger = logging.getLogger(__name__)


class ProductServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ProductNotFoundError(ProductServiceError):
    def __init__(self) -> None:
        super().__init__("We could not find that product.", 404)


class ProductAccessError(ProductServiceError):
    def __init__(self) -> None:
        super().__init__("You can only manage products that you submitted.", 403)


async def product_service_error_handler(request: Request, error: ProductServiceError) -> JSONResponse:
    logger.warning("Product request failed: %s", error.message)
    return JSONResponse(status_code=error.status_code, content={"detail": error.message})


async def unexpected_error_handler(request: Request, error: Exception) -> JSONResponse:
    logger.exception("Unexpected product service error")
    return JSONResponse(status_code=500, content={"detail": "We could not complete your request. Please try again."})