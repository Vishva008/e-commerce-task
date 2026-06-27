import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

function Card({ title, value, color }) {
  return (
    <div
      className={`rounded-lg p-6 shadow text-white ${color}`}
    >
      <h2 className="text-lg">
        {title}
      </h2>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
    pending: 0,
    delivered: 0,
    lowStock: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
  document.title = "Admin Dashboard | E-Shop";
}, []);

  async function loadDashboard() {
    const [
      { data: products },
      { data: orders },
      { count: customerCount },
    ] = await Promise.all([
      // Products: only stock is needed (for count + low-stock check)
      supabase.from("products").select("id, stock"),

      // Orders: only the columns used for stats / recent orders table
      supabase
        .from("orders")
        .select("id, email, total_amount, status, created_at"),

      // Customers: only the count is needed, so skip fetching any rows
      supabase
        .from("profile")
        .select("id", { count: "exact", head: true }),
    ]);

    const revenue =
      orders?.reduce(
        (sum, order) =>
          sum + Number(order.total_amount),
        0
      ) || 0;

    const pending =
      orders?.filter(
        (o) => o.status === "Placed"
      ).length || 0;

    const delivered =
      orders?.filter(
        (o) => o.status === "Delivered"
      ).length || 0;

    const lowStock =
      products?.filter(
        (p) => p.stock <= 5
      ).length || 0;

    setStats({
      products: products?.length || 0,
      orders: orders?.length || 0,
      customers: customerCount || 0,
      revenue,
      pending,
      delivered,
      lowStock,
    });

    setRecentOrders(
      orders
        ?.sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        )
        .slice(0, 5) || []
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-8">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <Card
            title="Products"
            value={stats.products}
            color="bg-blue-600"
          />

          <Card
            title="Orders"
            value={stats.orders}
            color="bg-green-600"
          />

          <Card
            title="Customers"
            value={stats.customers}
            color="bg-purple-600"
          />

          <Card
            title="Revenue"
            value={`₹${stats.revenue}`}
            color="bg-orange-600"
          />

          <Card
            title="Pending Orders"
            value={stats.pending}
            color="bg-yellow-500"
          />

          <Card
            title="Delivered"
            value={stats.delivered}
            color="bg-emerald-600"
          />

          <Card
            title="Low Stock"
            value={stats.lowStock}
            color="bg-red-600"
          />

        </div>

        <div className="flex gap-4 mt-10">

          <Link
            to="/admin/products"
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Manage Products
          </Link>

          <Link
            to="/admin/orders"
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Manage Orders
          </Link>

          <Link
            to="/admin/users"
            className="bg-purple-600 text-white px-6 py-3 rounded"
          >
            Manage Users
          </Link>

          <Link
            to="/admin/sales"
            className="bg-orange-600 text-white px-6 py-3 rounded"
          >
            Sales Overview
          </Link>

        </div>

        <div className="mt-12">

          <h2 className="text-2xl font-bold mb-4">
            Recent Orders
          </h2>

          <table className="w-full border border-collapse">

            <thead className="bg-gray-100">

              <tr>
                <th className="border p-3">
                  Order ID
                </th>

                <th className="border p-3">
                  Customer
                </th>

                <th className="border p-3">
                  Amount
                </th>

                <th className="border p-3">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {recentOrders.map(
                (order) => (
                  <tr key={order.id}>
                    <td className="border p-3">
                      #{order.id}
                    </td>

                    <td className="border p-3">
                      {order.email}
                    </td>

                    <td className="border p-3">
                      ₹
                      {order.total_amount}
                    </td>

                    <td className="border p-3">
                      {order.status}
                    </td>
                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </div>
    </>
  );
}

export default AdminDashboard;