
import { useEffect, useState } from "react";

import { getOrders, getProducts, getCustomers } from "../api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [ordersData, productsData, customersData] =
          await Promise.all([
            getOrders(),
            getProducts(),
            getCustomers(),
          ]);

        setOrders(ordersData);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getProductName = (productId) => {
    const product = products.find(
      (item) => item.id === productId
    );

    return product ? product.name : `Product #${productId}`;
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(
      (item) => item.id === customerId
    );

    return customer ? customer.name : `Customer #${customerId}`;
  };

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const statusStyles = {
    Pending: "bg-yellow-500/10 text-yellow-400",
    Confirmed: "bg-blue-500/10 text-blue-400",
    Shipped: "bg-blue-500/10 text-blue-400",
    Delivered: "bg-green-500/10 text-green-400",
    Cancelled: "bg-red-500/10 text-red-400",
  };

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <p className="text-gray-400">
          Loading orders...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Orders
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Manage and monitor your e-commerce orders.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">
            Total Orders
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            {orders.length}
          </h2>
        </div>

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
            Completed
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-400">
            {completedOrders}
          </h2>
        </div>

      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            Recent Orders
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            View and monitor your latest customer orders.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-gray-800 bg-gray-950/50">

              <tr>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>

                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
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

              {orders.map((order) => {

                const status = formatStatus(order.status);

                return (
                  <tr
                    key={order.id}
                    className="transition hover:bg-gray-800/40"
                  >

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-white">
                      #ORD-{order.id}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-300">
                      {getCustomerName(order.customer_id)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                      {getProductName(order.product_id)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                      {order.quantity}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                      ${Number(order.total_price).toFixed(2)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusStyles[status] ||
                          "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {status}
                      </span>

                    </td>

                  </tr>
                );

              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Orders;

