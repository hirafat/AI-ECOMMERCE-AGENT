
import { useEffect, useState } from "react";
import { getAnalytics, getSalesOverview } from "../api";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [salesData, setSalesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);

        const sales = await getSalesOverview();
        setSalesData(sales);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <p className="text-gray-400">Loading analytics...</p>
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
          Analytics
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Track your e-commerce performance and business insights.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Total Revenue</p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            ${Number(analytics.total_sales).toFixed(2)}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Based on all orders
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Total Orders</p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {analytics.total_orders}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Orders in database
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Total Customers</p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {analytics.total_customers}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Registered customers
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Total Products</p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            {analytics.total_products}
          </h2>
          <p className="mt-2 text-xs text-gray-500">
            Products available
          </p>
        </div>

      </div>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Order Overview */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 lg:col-span-2">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Order Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Current order status breakdown.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">

            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
              <p className="text-xs text-gray-400">Pending</p>
              <p className="mt-2 text-2xl font-bold text-yellow-400">
                {analytics.pending_orders}
              </p>
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="text-xs text-gray-400">Confirmed</p>
              <p className="mt-2 text-2xl font-bold text-blue-400">
                {analytics.confirmed_orders}
              </p>
            </div>

            <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
              <p className="text-xs text-gray-400">Shipped</p>
              <p className="mt-2 text-2xl font-bold text-purple-400">
                {analytics.shipped_orders}
              </p>
            </div>

            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <p className="text-xs text-gray-400">Delivered</p>
              <p className="mt-2 text-2xl font-bold text-green-400">
                {analytics.delivered_orders}
              </p>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-xs text-gray-400">Cancelled</p>
              <p className="mt-2 text-2xl font-bold text-red-400">
                {analytics.cancelled_orders}
              </p>
            </div>

          </div>
        </div>

        {/* Store Summary */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Store Summary
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Live store statistics.
            </p>
          </div>

          <div className="space-y-4">

            <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
              <p className="text-sm text-gray-400">Total Sales</p>
              <p className="mt-1 text-xl font-bold text-white">
                ${Number(analytics.total_sales).toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
              <p className="text-sm text-gray-400">Pending Orders</p>
              <p className="mt-1 text-xl font-bold text-yellow-400">
                {analytics.pending_orders}
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-4">
              <p className="text-sm text-gray-400">Delivered Orders</p>
              <p className="mt-1 text-xl font-bold text-green-400">
                {analytics.delivered_orders}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Sales Overview */}
      <div className="mt-6 rounded-2xl border border-gray-800 bg-gray-900 p-6">

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Sales Overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Sales generated from your orders.
          </p>
        </div>

        <div className="flex h-64 items-end gap-4">

          {Object.entries(salesData).length === 0 ? (
            <p className="text-sm text-gray-500">
              No sales data available yet.
            </p>
          ) : (
            Object.entries(salesData).map(([month, sales]) => {

              const maxSales = Math.max(
                ...Object.values(salesData).map(Number)
              );

              const height =
                maxSales > 0
                  ? Math.max((Number(sales) / maxSales) * 100, 8)
                  : 8;

              return (
                <div
                  key={month}
                  className="flex h-full flex-1 flex-col items-center justify-end"
                >

                  <p className="mb-2 text-xs text-gray-400">
                    ${Number(sales).toFixed(2)}
                  </p>

                  <div
                    className="w-full rounded-t-lg bg-blue-500 transition-all duration-500"
                    style={{ height: `${height}%` }}
                  />

                  <p className="mt-2 text-xs font-medium text-gray-400">
                    {month}
                  </p>

                </div>
              );
            })
          )}

        </div>
      </div>

      {/* Performance Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">

        <div className="border-b border-gray-800 px-6 py-5">
          <h2 className="text-lg font-semibold text-white">
            Performance Summary
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Live overview of your store performance.
          </p>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="border-b border-gray-800 bg-gray-950/50">
              <tr>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Metric
                </th>
                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                  Current
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-800">

              <tr className="transition hover:bg-gray-800/40">
                <td className="px-6 py-4 text-sm font-medium text-white">
                  Revenue
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  ${Number(analytics.total_sales).toFixed(2)}
                </td>
              </tr>

              <tr className="transition hover:bg-gray-800/40">
                <td className="px-6 py-4 text-sm font-medium text-white">
                  Orders
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {analytics.total_orders}
                </td>
              </tr>

              <tr className="transition hover:bg-gray-800/40">
                <td className="px-6 py-4 text-sm font-medium text-white">
                  Customers
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {analytics.total_customers}
                </td>
              </tr>

              <tr className="transition hover:bg-gray-800/40">
                <td className="px-6 py-4 text-sm font-medium text-white">
                  Products
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {analytics.total_products}
                </td>
              </tr>

            </tbody>
          </table>

        </div>
      </div>

    </div>
  );
}

export default Analytics;

