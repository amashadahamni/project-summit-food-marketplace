from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Product Service")

class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: str
    stock: int
    supplier_id: int
    approved: bool = False
    status: str = "pending"
    rejection_reason: str = ""

products: List[Product] = []
product_id_counter = 1

@app.get("/products", response_model=List[Product])
def list_products(approved: bool = True):
    return [product for product in products if product.approved == approved]

@app.post("/products", response_model=Product)
def create_product(product: Product):
    global product_id_counter
    product.id = product_id_counter
    product_id_counter += 1
    products.append(product)
    return product

@app.put("/products/{product_id}", response_model=Product)
def update_product(product_id: int, update: Product):
    for index, product in enumerate(products):
        if product.id == product_id:
            update.id = product_id
            products[index] = update
            return update
    raise HTTPException(status_code=404, detail="Product not found")

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: int):
    for product in products:
        if product.id == product_id:
            return product
    raise HTTPException(status_code=404, detail="Product not found")
