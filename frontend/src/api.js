const API_BASE_URL = "http://127.0.0.1:8000";

// ==================== PRODUCTS ====================

export const getProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};


export const getProduct = async (productId) => {
  const response = await fetch(
    `${API_BASE_URL}/products/${productId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
};


// ==================== AI AGENT ====================

export const askAgent = async (query) => {
  const response = await fetch(
    `${API_BASE_URL}/agent?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error("Failed to contact AI agent");
  }

  return response.json();
};


// ==================== ORDERS ====================

export const createOrder = async (productId, customerId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      customer_id: customerId,
      quantity: quantity,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create order");
  }

  return response.json();
};




export const getOrders = async () => {
  const response = await fetch(`${API_BASE_URL}/orders`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  return response.json();
};


export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}/status?status=${encodeURIComponent(status)}`,
    {
      method: "PUT",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update order status");
  }

  return response.json();
};


export const deleteOrder = async (orderId) => {
  const response = await fetch(
    `${API_BASE_URL}/orders/${orderId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete order");
  }

  return response.json();
};

// Get Analytics
export const getAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics`);

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
};

export const getSalesOverview = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics/sales`);

  if (!response.ok) {
    throw new Error("Failed to fetch sales overview");
  }

  return response.json();
};

export const getCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/customers`);

  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }

  return response.json();
};


// REGISTER CUSTOMER
export const registerCustomer = async (
  name,
  email,
  password
) => {
  const response = await fetch(
    `${API_BASE_URL}/customers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        status: "Active",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Registration failed"
    );
  }

  return data;
};

// LOGIN CUSTOMER
// LOGIN CUSTOMER
export const loginCustomer = async (email, password) => {
  const response = await fetch(
    `${API_BASE_URL}/customers/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  console.log("Login API response:", data);

  if (!response.ok) {
    throw new Error(
      data.detail || data.message || "Login failed"
    );
  }

  return data;
};