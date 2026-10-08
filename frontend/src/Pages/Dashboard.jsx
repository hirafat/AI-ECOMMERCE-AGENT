import { useEffect, useState } from "react";

function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, productsRes, customersRes] =
          await Promise.all([
            fetch(`${API_URL}/orders`),
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/customers`),
          ]);

        if (!ordersRes.ok || !productsRes.ok || !customersRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        const customersData = await customersRes.json();

        setOrders(ordersData);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate statistics
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status?.toLowerCase() === "pending"
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status?.toLowerCase() === "delivered" ||
      order.status?.toLowerCase() === "completed"
  ).length;

  const totalRevenue = orders.reduce(
    (total, order) => total + Number(order.total_price || 0),
    0
  );

  const activeCustomers = customers.filter(
    (customer) => customer.status?.toLowerCase() === "active"
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Overview of your e-commerce business.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center text-gray-400">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Products */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-sm text-gray-400">
                Total Products
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {products.length}
              </h2>
            </div>

            {/* Orders */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-sm text-gray-400">
                Total Orders
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {totalOrders}
              </h2>
            </div>

            {/* Customers */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-sm text-gray-400">
                Total Customers
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {customers.length}
              </h2>

              <p className="mt-1 text-xs text-green-400">
                {activeCustomers} active
              </p>
            </div>

            {/* Revenue */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-sm text-gray-400">
                Total Revenue
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-400">
                ${totalRevenue.toFixed(2)}
              </h2>
            </div>
          </div>

          {/* Order Summary */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-sm text-gray-400">
                Pending Orders
              </p>

              <h2 className="mt-2 text-2xl font-bold text-yellow-400">
                {pendingOrders}
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-sm text-gray-400">
                Completed Orders
              </p>

              <h2 className="mt-2 text-2xl font-bold text-green-400">
                {completedOrders}
              </h2>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
            <div className="border-b border-gray-800 px-6 py-5">
              <h2 className="text-lg font-semibold text-white">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest orders from your customers.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No orders found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-800 bg-gray-950/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Order
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Product ID
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Quantity
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Amount
                      </th>

                      <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-800">
                    {orders.slice(-5).reverse().map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-gray-800/40"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-white">
                          #ORD-{order.id}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-400">
                          Product #{order.product_id}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-300">
                          {order.quantity}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-white">
                          ${Number(order.total_price).toFixed(2)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              order.status?.toLowerCase() === "pending"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : order.status?.toLowerCase() === "delivered" ||
                                  order.status?.toLowerCase() === "completed"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;