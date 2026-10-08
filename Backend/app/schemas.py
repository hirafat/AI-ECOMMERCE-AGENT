
from pydantic import BaseModel
from datetime import datetime


# -------------------------
# PRODUCT SCHEMAS
# -------------------------

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str

    class Config:
        from_attributes = True


# -------------------------
# ORDER SCHEMAS
# -------------------------

class OrderCreate(BaseModel):
    product_id: int
    customer_id: int
    quantity: int


class OrderResponse(BaseModel):
    id: int
    product_id: int
    customer_id: int
    quantity: int
    total_price: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True



# -------------------------
# CUSTOMER SCHEMAS
# -------------------------

class CustomerCreate(BaseModel):
    name: str
    email: str
    password: str
    status: str = "Active"



class CustomerResponse(BaseModel):
    id: int
    name: str
    email: str
    status: str

    class Config:
        from_attributes = True

