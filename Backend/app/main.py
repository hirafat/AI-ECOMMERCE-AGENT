
from fastapi import FastAPI, Depends, HTTPException
from pwdlib import PasswordHash
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base, get_db
from . import models, schemas
from .agent import ecommerce_agent


# =========================================================
# PASSWORD HASHING
# =========================================================

password_hash = PasswordHash.recommended()


# =========================================================
# APP
# =========================================================

app = FastAPI(title="AI E-Commerce Agent")


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# CREATE DATABASE TABLES
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "AI E-Commerce Agent API is running 🚀"
    }


# =========================================================
# PRODUCTS
# =========================================================

# CREATE PRODUCT

@app.post("/products", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    new_product = models.Product(
        name=product.name,
        description=product.description,
        price=product.price,
        category=product.category
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# GET ALL PRODUCTS

@app.get("/products", response_model=list[schemas.ProductResponse])
def get_products(
    db: Session = Depends(get_db)
):
    return db.query(models.Product).all()


# GET SINGLE PRODUCT

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    return product


# UPDATE PRODUCT

@app.put("/products/{product_id}", response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    product: schemas.ProductCreate,
    db: Session = Depends(get_db)
):
    existing_product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not existing_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    existing_product.name = product.name
    existing_product.description = product.description
    existing_product.price = product.price
    existing_product.category = product.category

    db.commit()
    db.refresh(existing_product)

    return existing_product


# DELETE PRODUCT

@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = (
        db.query(models.Product)
        .filter(models.Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }


# SEARCH PRODUCTS

@app.get("/products/search", response_model=list[schemas.ProductResponse])
def search_products(
    query: str,
    db: Session = Depends(get_db)
):
    products = (
        db.query(models.Product)
        .filter(
            (models.Product.name.ilike(f"%{query}%")) |
            (models.Product.description.ilike(f"%{query}%")) |
            (models.Product.category.ilike(f"%{query}%"))
        )
        .all()
    )

    return products


# FILTER PRODUCTS BY MAXIMUM PRICE

@app.get("/products/filter", response_model=list[schemas.ProductResponse])
def filter_products(
    max_price: float,
    db: Session = Depends(get_db)
):
    products = (
        db.query(models.Product)
        .filter(models.Product.price <= max_price)
        .all()
    )

    return products


# FILTER PRODUCTS BY CATEGORY

@app.get("/products/category", response_model=list[schemas.ProductResponse])
def filter_by_category(
    category: str,
    db: Session = Depends(get_db)
):
    products = (
        db.query(models.Product)
        .filter(models.Product.category.ilike(category))
        .all()
    )

    return products


# =========================================================
# ORDERS
# =========================================================

# CREATE ORDER

@app.post("/orders", response_model=schemas.OrderResponse)
def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db)
):
    # Check product

    product = (
        db.query(models.Product)
        .filter(models.Product.id == order.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    # Check customer

    customer = (
        db.query(models.Customer)
        .filter(models.Customer.id == order.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Check quantity

    if order.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than 0"
        )

    # Calculate total price

    total_price = product.price * order.quantity

    # Create order

    new_order = models.Order(
        product_id=order.product_id,
        customer_id=order.customer_id,
        quantity=order.quantity,
        total_price=total_price,
        status="pending"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


# GET ALL ORDERS

@app.get("/orders", response_model=list[schemas.OrderResponse])
def get_orders(
    db: Session = Depends(get_db)
):
    return db.query(models.Order).all()


# UPDATE ORDER STATUS

@app.put("/orders/{order_id}/status")
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    allowed_statuses = {
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
    }

    status = status.lower()

    if status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid status",
                "allowed_statuses": list(allowed_statuses)
            }
        )

    order.status = status

    db.commit()
    db.refresh(order)

    return {
        "message": "Order status updated successfully",
        "order_id": order.id,
        "status": order.status
    }


# DELETE ORDER

@app.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db)
):
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found"
        )

    db.delete(order)
    db.commit()

    return {
        "message": "Order deleted successfully",
        "order_id": order_id
    }


# =========================================================
# CUSTOMERS
# =========================================================

# CREATE CUSTOMER / REGISTER

@app.post("/customers", response_model=schemas.CustomerResponse)
def create_customer(
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    # Check duplicate email

    existing_customer = (
        db.query(models.Customer)
        .filter(models.Customer.email == customer.email)
        .first()
    )

    if existing_customer:
        raise HTTPException(
            status_code=400,
            detail="Customer with this email already exists"
        )

    # Create customer with hashed password

    new_customer = models.Customer(
        name=customer.name,
        email=customer.email,
        password=password_hash.hash(customer.password),
        status=customer.status
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


# LOGIN CUSTOMER

@app.post("/customers/login")
def login_customer(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.email == email)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not customer.password:
        raise HTTPException(
            status_code=400,
            detail="This account does not have a password set"
        )

    if not password_hash.verify(
        password,
        customer.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "customer_id": customer.id,
        "name": customer.name,
        "email": customer.email
    }


# GET ALL CUSTOMERS

@app.get("/customers", response_model=list[schemas.CustomerResponse])
def get_customers(
    db: Session = Depends(get_db)
):
    return db.query(models.Customer).all()


# GET SINGLE CUSTOMER

@app.get(
    "/customers/{customer_id}",
    response_model=schemas.CustomerResponse
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer


# UPDATE CUSTOMER

@app.put(
    "/customers/{customer_id}",
    response_model=schemas.CustomerResponse
)
def update_customer(
    customer_id: int,
    customer: schemas.CustomerCreate,
    db: Session = Depends(get_db)
):
    existing_customer = (
        db.query(models.Customer)
        .filter(models.Customer.id == customer_id)
        .first()
    )

    if not existing_customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Check duplicate email

    duplicate_email = (
        db.query(models.Customer)
        .filter(
            models.Customer.email == customer.email,
            models.Customer.id != customer_id
        )
        .first()
    )

    if duplicate_email:
        raise HTTPException(
            status_code=400,
            detail="Another customer already uses this email"
        )

    existing_customer.name = customer.name
    existing_customer.email = customer.email
    existing_customer.password = password_hash.hash(
        customer.password
    )
    existing_customer.status = customer.status

    db.commit()
    db.refresh(existing_customer)

    return existing_customer


# DELETE CUSTOMER

@app.delete("/customers/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    customer = (
        db.query(models.Customer)
        .filter(models.Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully",
        "customer_id": customer_id
    }


# SEARCH CUSTOMERS

@app.get(
    "/customers/search",
    response_model=list[schemas.CustomerResponse]
)
def search_customers(
    query: str,
    db: Session = Depends(get_db)
):
    customers = (
        db.query(models.Customer)
        .filter(
            (models.Customer.name.ilike(f"%{query}%")) |
            (models.Customer.email.ilike(f"%{query}%"))
        )
        .all()
    )

    return customers


# =========================================================
# AI E-COMMERCE AGENT
# =========================================================

@app.get("/agent")
def run_ecommerce_agent(
    query: str,
    db: Session = Depends(get_db)
):
    products = db.query(models.Product).all()
    customers = db.query(models.Customer).all()
    orders = db.query(models.Order).all()

    data = {
        "products": products,
        "customers": customers,
        "orders": orders
    }

    return ecommerce_agent(query, data)


# =========================================================
# ANALYTICS
# =========================================================

@app.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db)
):
    products = db.query(models.Product).all()
    customers = db.query(models.Customer).all()
    orders = db.query(models.Order).all()

    # Total sales

    total_sales = sum(
        float(order.total_price or 0)
        for order in orders
    )

    # Pending orders

    pending_orders = sum(
        1
        for order in orders
        if order.status
        and order.status.lower() == "pending"
    )

    # Delivered orders

    delivered_orders = sum(
        1
        for order in orders
        if order.status
        and order.status.lower() == "delivered"
    )

    # Confirmed orders

    confirmed_orders = sum(
        1
        for order in orders
        if order.status
        and order.status.lower() == "confirmed"
    )

    # Shipped orders

    shipped_orders = sum(
        1
        for order in orders
        if order.status
        and order.status.lower() == "shipped"
    )

    # Cancelled orders

    cancelled_orders = sum(
        1
        for order in orders
        if order.status
        and order.status.lower() == "cancelled"
    )

    return {
        "total_products": len(products),
        "total_customers": len(customers),
        "total_orders": len(orders),
        "total_sales": round(total_sales, 2),
        "pending_orders": pending_orders,
        "confirmed_orders": confirmed_orders,
        "shipped_orders": shipped_orders,
        "delivered_orders": delivered_orders,
        "cancelled_orders": cancelled_orders
    }


# =========================================================
# SALES OVERVIEW
# =========================================================

@app.get("/analytics/sales")
def get_sales_overview(
    db: Session = Depends(get_db)
):
    orders = db.query(models.Order).all()

    monthly_sales = {}

    for order in orders:
        if order.created_at:
            month = order.created_at.strftime("%b")

            monthly_sales[month] = (
                monthly_sales.get(month, 0)
                + float(order.total_price or 0)
            )

    return monthly_sales

