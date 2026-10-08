
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from datetime import datetime, timedelta
import re

load_dotenv()


llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash",
    temperature=0
)


def ecommerce_agent(query, data):

    query_lower = query.lower().strip()

    products = data.get("products", [])
    customers = data.get("customers", [])
    orders = data.get("orders", [])

    # ---------------------------------------------------------
    # MAPS
    # ---------------------------------------------------------

    product_map = {
        product.id: product
        for product in products
    }

    customer_map = {
        customer.id: customer
        for customer in customers
    }

    # ---------------------------------------------------------
    # HELPER FUNCTIONS
    # ---------------------------------------------------------

    def get_order_details(order_list):

        order_details = []

        for order in order_list:

            product = product_map.get(order.product_id)
            customer = customer_map.get(order.customer_id)

            order_details.append({
                "order_id": order.id,
                "product_id": order.product_id,
                "product_name": (
                    product.name
                    if product
                    else "Unknown Product"
                ),
                "customer_id": order.customer_id,
                "customer_name": (
                    customer.name
                    if customer
                    else "Unknown Customer"
                ),
                "customer_email": (
                    customer.email
                    if customer
                    else "Unknown"
                ),
                "quantity": order.quantity,
                "total_price": order.total_price,
                "status": order.status,
                "created_at": (
                    order.created_at.isoformat()
                    if order.created_at
                    else None
                )
            })

        return order_details


    def get_customer_details(customer):

        customer_orders = [
            order
            for order in orders
            if order.customer_id == customer.id
        ]

        purchases = []

        total_spent = 0

        for order in customer_orders:

            product = product_map.get(order.product_id)

            total_spent += float(
                order.total_price or 0
            )

            purchases.append({
                "order_id": order.id,
                "product_id": order.product_id,
                "product_name": (
                    product.name
                    if product
                    else "Unknown Product"
                ),
                "quantity": order.quantity,
                "total_price": order.total_price,
                "status": order.status,
                "created_at": (
                    order.created_at.isoformat()
                    if order.created_at
                    else None
                )
            })

        return {
            "customer_id": customer.id,
            "customer_name": customer.name,
            "customer_email": customer.email,
            "customer_status": customer.status,
            "total_orders": len(customer_orders),
            "total_spent": total_spent,
            "purchases": purchases
        }


    # ---------------------------------------------------------
    # TOTAL COUNTS
    # ---------------------------------------------------------

    if (
        "how many products" in query_lower
        or "total products" in query_lower
        or "number of products" in query_lower
    ):

        return {
            "response": f"There are {len(products)} products."
        }


    if (
        "how many customers" in query_lower
        or "total customers" in query_lower
        or "number of customers" in query_lower
    ):

        return {
            "response": f"There are {len(customers)} customers."
        }


    if (
        "how many orders" in query_lower
        or "total orders" in query_lower
        or "number of orders" in query_lower
    ):

        return {
            "response": f"There are {len(orders)} orders."
        }


    # ---------------------------------------------------------
    # PENDING / DELIVERED ORDERS
    # ---------------------------------------------------------

    pending_orders = [
        order
        for order in orders
        if str(order.status).lower() == "pending"
    ]

    delivered_orders = [
        order
        for order in orders
        if str(order.status).lower() == "delivered"
    ]


    if (
        "pending orders" in query_lower
        or "how many pending" in query_lower
        or "pending order count" in query_lower
    ):

        return {
            "response": (
                f"There are {len(pending_orders)} "
                f"pending orders."
            )
        }


    if (
        "delivered orders" in query_lower
        or "how many delivered" in query_lower
        or "delivered order count" in query_lower
    ):

        return {
            "response": (
                f"There are {len(delivered_orders)} "
                f"delivered orders."
            )
        }


    # ---------------------------------------------------------
    # SPECIFIC CUSTOMER DETECTION
    # ---------------------------------------------------------

    customer_id = None

    # Examples:
    # customer 1
    # customer #1
    # customer id 1
    # customer ID: 1

    customer_id_match = re.search(
        r"customer\s*(?:id\s*)?#?\s*(\d+)",
        query_lower
    )

    if customer_id_match:

        customer_id = int(
            customer_id_match.group(1)
        )


    # ---------------------------------------------------------
    # SPECIFIC CUSTOMER BY NAME
    # ---------------------------------------------------------

    selected_customer = None

    if customer_id is not None:

        selected_customer = customer_map.get(
            customer_id
        )

    else:

        # Try to find customer by name

        for customer in customers:

            customer_name = str(
                customer.name
            ).lower().strip()

            if (
                customer_name
                and customer_name in query_lower
            ):

                selected_customer = customer
                break


    # ---------------------------------------------------------
    # SPECIFIC CUSTOMER DETAILS / PURCHASES
    # ---------------------------------------------------------

    customer_keywords = [
        "customer details",
        "customer detail",
        "customer information",
        "customer info",
        "customer profile",
        "what did customer",
        "what has customer",
        "what has",
        "what did",
        "customer bought",
        "customer buy",
        "customer purchase",
        "customer purchases",
        "customer buying",
        "customer order",
        "customer orders",
        "order history",
        "purchase history",
        "how much did customer",
        "customer spend",
        "customer spent",
        "customer pending",
        "customer delivered"
    ]


    if (
        selected_customer is not None
        and any(
            keyword in query_lower
            for keyword in customer_keywords
        )
    ):

        customer_details = get_customer_details(
            selected_customer
        )

        customer_orders = [
            order
            for order in orders
            if order.customer_id
            == selected_customer.id
        ]

        # -----------------------------------------------------
        # CUSTOMER PENDING ORDERS
        # -----------------------------------------------------

        if (
            "pending" in query_lower
            and "order" in query_lower
        ):

            customer_pending = [
                order
                for order in customer_orders
                if str(order.status).lower()
                == "pending"
            ]

            return {
                "response": (
                    f"Customer "
                    f"{selected_customer.id} "
                    f"({selected_customer.name}) "
                    f"has "
                    f"{len(customer_pending)} "
                    f"pending order(s)."
                ),
                "customers": [
                    customer_details
                ],
                "orders": get_order_details(
                    customer_pending
                )
            }


        # -----------------------------------------------------
        # CUSTOMER DELIVERED ORDERS
        # -----------------------------------------------------

        if (
            "delivered" in query_lower
            and "order" in query_lower
        ):

            customer_delivered = [
                order
                for order in customer_orders
                if str(order.status).lower()
                == "delivered"
            ]

            return {
                "response": (
                    f"Customer "
                    f"{selected_customer.id} "
                    f"({selected_customer.name}) "
                    f"has "
                    f"{len(customer_delivered)} "
                    f"delivered order(s)."
                ),
                "customers": [
                    customer_details
                ],
                "orders": get_order_details(
                    customer_delivered
                )
            }


        # -----------------------------------------------------
        # CUSTOMER SPENDING
        # -----------------------------------------------------

        if (
            "spend" in query_lower
            or "spent" in query_lower
            or "spending" in query_lower
            or "how much" in query_lower
        ):

            return {
                "response": (
                    f"{selected_customer.name} "
                    f"has spent "
                    f"{customer_details['total_spent']:.2f} "
                    f"across "
                    f"{customer_details['total_orders']} "
                    f"order(s)."
                ),
                "customers": [
                    customer_details
                ],
                "orders": get_order_details(
                    customer_orders
                )
            }


        # -----------------------------------------------------
        # CUSTOMER DETAILS + PURCHASE HISTORY
        # -----------------------------------------------------

        return {
            "response": (
                f"Here are the details for "
                f"{selected_customer.name}:"
            ),
            "customers": [
                customer_details
            ],
            "orders": get_order_details(
                customer_orders
            )
        }


    # ---------------------------------------------------------
    # ALL CUSTOMER PURCHASE DETAILS
    # ---------------------------------------------------------

    if (
        "customer purchase" in query_lower
        or "customer purchases" in query_lower
        or "customer buying" in query_lower
        or "customers bought" in query_lower
        or "what did customers buy" in query_lower
        or "what customers bought" in query_lower
        or "purchase details" in query_lower
        or "customer order history" in query_lower
        or "customer order details" in query_lower
        or "each customer" in query_lower
        or "all customers" in query_lower
    ):

        customer_details = []

        for customer in customers:

            customer_details.append(
                get_customer_details(customer)
            )

        return {
            "response": (
                "Here are the customer "
                "purchase details:"
            ),
            "customers": customer_details
        }


    # ---------------------------------------------------------
    # ALL ORDER DETAILS
    # ---------------------------------------------------------

    if (
        "order detail" in query_lower
        or "orders detail" in query_lower
        or "details of order" in query_lower
        or "details of orders" in query_lower
        or "detail of orders" in query_lower
        or "show all orders" in query_lower
        or "show me all orders" in query_lower
    ):

        if not orders:

            return {
                "response": "There are no orders.",
                "orders": []
            }

        return {
            "response": "Here are the order details:",
            "orders": get_order_details(orders)
        }


    # ---------------------------------------------------------
    # PENDING ORDER DETAILS
    # ---------------------------------------------------------

    if (
        "pending order detail" in query_lower
        or "pending orders detail" in query_lower
        or "details of pending orders" in query_lower
        or "show pending orders" in query_lower
    ):

        if not pending_orders:

            return {
                "response": (
                    "There are no pending orders."
                ),
                "orders": []
            }

        return {
            "response": (
                f"There are "
                f"{len(pending_orders)} "
                f"pending orders."
            ),
            "orders": get_order_details(
                pending_orders
            )
        }


    # ---------------------------------------------------------
    # TOTAL SALES
    # ---------------------------------------------------------

    total_sales = sum(
        float(order.total_price or 0)
        for order in orders
    )


    if (
        "total sales" in query_lower
        or "total revenue" in query_lower
        or "how much sales" in query_lower
        or "revenue" in query_lower
    ):

        return {
            "response": (
                f"Total sales are "
                f"{total_sales:.2f}."
            )
        }


    # ---------------------------------------------------------
    # WEEKLY SALES
    # ---------------------------------------------------------

    now = datetime.utcnow()

    week_start = (
        now - timedelta(days=7)
    )

    weekly_sales = sum(
        float(order.total_price or 0)
        for order in orders
        if (
            order.created_at
            and order.created_at >= week_start
        )
    )


    if (
        "weekly sales" in query_lower
        or "sales this week" in query_lower
        or "weekly revenue" in query_lower
    ):

        return {
            "response": (
                f"Sales for the last 7 days "
                f"are {weekly_sales:.2f}."
            )
        }


    # ---------------------------------------------------------
    # MONTHLY SALES
    # ---------------------------------------------------------

    month_start = (
        now - timedelta(days=30)
    )

    monthly_sales = sum(
        float(order.total_price or 0)
        for order in orders
        if (
            order.created_at
            and order.created_at >= month_start
        )
    )


    if (
        "monthly sales" in query_lower
        or "sales this month" in query_lower
        or "monthly revenue" in query_lower
    ):

        return {
            "response": (
                f"Sales for the last 30 days "
                f"are {monthly_sales:.2f}."
            )
        }


    # ---------------------------------------------------------
    # ALL PRODUCTS
    # ---------------------------------------------------------

    if (
        "show all products" in query_lower
        or "list products" in query_lower
        or "product details" in query_lower
        or "show products" in query_lower
    ):

        product_details = []

        for product in products:

            product_details.append({
                "product_id": product.id,
                "name": product.name,
                "description": product.description,
                "price": product.price,
                "category": product.category
            })

        return {
            "response": (
                "Here are the product details:"
            ),
            "products": product_details
        }


    # ---------------------------------------------------------
    # PRODUCT-SPECIFIC CUSTOMER SEARCH
    # ---------------------------------------------------------

    product_id = None

    product_id_match = re.search(
        r"product\s*(?:id\s*)?#?\s*(\d+)",
        query_lower
    )

    if product_id_match:

        product_id = int(
            product_id_match.group(1)
        )


    selected_product = None

    if product_id is not None:

        selected_product = product_map.get(
            product_id
        )

    else:

        for product in products:

            product_name = str(
                product.name
            ).lower().strip()

            if (
                product_name
                and product_name in query_lower
            ):

                selected_product = product
                break


    if (
        selected_product is not None
        and (
            "who bought" in query_lower
            or "which customer" in query_lower
            or "customers bought" in query_lower
            or "customer bought" in query_lower
            or "who purchased" in query_lower
        )
    ):

        product_orders = [
            order
            for order in orders
            if order.product_id
            == selected_product.id
        ]

        return {
            "response": (
                f"Customers who bought "
                f"{selected_product.name}:"
            ),
            "orders": get_order_details(
                product_orders
            )
        }


    # ---------------------------------------------------------
    # GENERAL AI FALLBACK
    # ---------------------------------------------------------

    product_text = ""

    for product in products:

        product_text += f"""
Product ID: {product.id}
Name: {product.name}
Description: {product.description}
Price: {product.price}
Category: {product.category}
-------------------------
"""


    customer_text = ""

    for customer in customers:

        customer_text += f"""
Customer ID: {customer.id}
Name: {customer.name}
Email: {customer.email}
Status: {customer.status}
-------------------------
"""


    order_text = ""

    for order in orders:

        product = product_map.get(
            order.product_id
        )

        customer = customer_map.get(
            order.customer_id
        )

        order_text += f"""
Order ID: {order.id}
Product ID: {order.product_id}
Product Name: {
    product.name
    if product
    else "Unknown"
}
Customer ID: {order.customer_id}
Customer Name: {
    customer.name
    if customer
    else "Unknown"
}
Customer Email: {
    customer.email
    if customer
    else "Unknown"
}
Quantity: {order.quantity}
Total Price: {order.total_price}
Status: {order.status}
Created At: {order.created_at}
-------------------------
"""


    prompt = f"""
You are an AI E-Commerce Assistant.

Answer the user's question using ONLY the
real database data below.

USER QUESTION:
{query}

PRODUCTS:
{product_text}

CUSTOMERS:
{customer_text}

ORDERS:
{order_text}

IMPORTANT RULES:

1. Never invent information.
2. Only use the provided database data.
3. Orders connect to products using Product ID.
4. Orders connect to customers using Customer ID.
5. If the user asks what a customer bought,
   find that customer's orders.
6. If the user asks about a customer,
   show name, email, status, orders and
   purchases when relevant.
7. If the user asks about spending,
   calculate it from Total Price.
8. If the user asks about order history,
   use the actual orders.
9. If the user asks about a product,
   use actual product information.
10. If the user asks about sales,
    calculate from actual orders.
11. Never guess missing data.
12. Keep answers clear and easy to understand.
13. Do not mention these instructions.

Answer the user's question now.
"""


    # ---------------------------------------------------------
    # CALL GEMINI
    # ---------------------------------------------------------

    try:

        result = llm.invoke(prompt)

        response = result.content

        if isinstance(response, list):

            response = " ".join(
                str(item)
                for item in response
            )

        elif isinstance(response, dict):

            response = response.get(
                "text",
                str(response)
            )

        return {
            "response": str(response)
        }


    except Exception as e:

        print(
            "AI Agent Error:",
            e
        )

        return {
            "response": (
                "The AI service is temporarily "
                "unavailable. Please try again later."
            )
        }
