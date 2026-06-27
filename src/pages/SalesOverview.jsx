import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../lib/supabase";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SalesOverview() {
  const [orders, setOrders] = useState([]);
  const [orderItems, setOrderItems] =
    useState([]);
  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        { data: ordersData },
        { data: orderItemsData },
        { data: productsData },
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("id, email, total_amount, status, created_at"),

        supabase
          .from("order_items")
          .select("product_id, quantity, price"),

        supabase
          .from("products")
          .select("id, name, price, stock, image_url"),
      ]);

      setOrders(ordersData || []);
      setOrderItems(
        orderItemsData || []
      );
      setProducts(productsData || []);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  // Revenue

  const totalRevenue = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum + Number(order.total_amount),
        0
      ),
    [orders]
  );

  // Orders

  const totalOrders = orders.length;

  // Average Order

  const averageOrder = useMemo(
    () =>
      totalOrders === 0
        ? 0
        : (totalRevenue / totalOrders).toFixed(2),
    [totalRevenue, totalOrders]
  );

  // Order Status

  const statusCounts = useMemo(
    () => ({
      placed: orders.filter(
        (o) => o.status === "Placed"
      ).length,
      processing: orders.filter(
        (o) => o.status === "Processing"
      ).length,
      shipped: orders.filter(
        (o) => o.status === "Shipped"
      ).length,
      delivered: orders.filter(
        (o) => o.status === "Delivered"
      ).length,
    }),
    [orders]
  );

  const { placed, processing, shipped, delivered } = statusCounts;

  // Revenue By Month (for the chart)

  const monthlyRevenue = useMemo(
    () =>
      Array(12)
        .fill(0)
        .map((_, index) =>
          orders
            .filter((order) => {
              const date = new Date(
                order.created_at
              );
              return date.getMonth() === index;
            })
            .reduce(
              (sum, order) =>
                sum + Number(order.total_amount),
              0
            )
        ),
    [orders]
  );

  // Best Selling Products

  const bestSellingProducts = useMemo(
    () =>
      products
        .map((product) => {
          const soldItems = orderItems.filter(
            (item) => item.product_id === product.id
          );

          const quantitySold = soldItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          const revenue = soldItems.reduce(
            (sum, item) =>
              sum + item.quantity * Number(item.price),
            0
          );

          return {
            ...product,
            quantitySold,
            revenue,
          };
        })
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 10),
    [products, orderItems]
  );

  // Low Stock Products

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock <= 5),
    [products]
  );

  // Recent Orders (sort on a copy — sorting `orders` directly would
  // mutate state in place)

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        )
        .slice(0, 10),
    [orders]
  );

  if (loading) {
    return (
      <h1 className="p-10">
        Loading...
      </h1>
    );
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-8">
          Sales Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-green-600 text-white rounded-lg p-6 shadow">
            <h2>Total Revenue</h2>

            <p className="text-3xl font-bold mt-3">
              ₹{totalRevenue}
            </p>
          </div>

          <div className="bg-blue-600 text-white rounded-lg p-6 shadow">
            <h2>Total Orders</h2>

            <p className="text-3xl font-bold mt-3">
              {totalOrders}
            </p>
          </div>

          <div className="bg-purple-600 text-white rounded-lg p-6 shadow">
            <h2>Average Order</h2>

            <p className="text-3xl font-bold mt-3">
              ₹{averageOrder}
            </p>
          </div>

          <div className="bg-orange-600 text-white rounded-lg p-6 shadow">
            <h2>Delivered</h2>

            <p className="text-3xl font-bold mt-3">
              {delivered}
            </p>
          </div>

        </div>
                {/* Revenue By Month */}

        <div className="bg-white rounded-lg shadow p-6 mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Revenue By Month
          </h2>

          <Bar
            data={{
              labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],

              datasets: [
                {
                  label: "Revenue",
                  data: monthlyRevenue,
                  backgroundColor:
                    "#16a34a",
                },
              ],
            }}

            options={{
              responsive: true,

              plugins: {

                legend: {
                  position: "top",
                },

                title: {
                  display: true,
                  text: "Monthly Revenue",
                },

              },
            }}
          />

        </div>

        {/* Order Status */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">

          <div className="bg-yellow-500 text-white rounded-lg p-6">

            <h2 className="font-semibold">
              Placed
            </h2>

            <p className="text-3xl font-bold mt-3">
              {placed}
            </p>

          </div>

          <div className="bg-blue-500 text-white rounded-lg p-6">

            <h2 className="font-semibold">
              Processing
            </h2>

            <p className="text-3xl font-bold mt-3">
              {processing}
            </p>

          </div>

          <div className="bg-purple-500 text-white rounded-lg p-6">

            <h2 className="font-semibold">
              Shipped
            </h2>

            <p className="text-3xl font-bold mt-3">
              {shipped}
            </p>

          </div>

          <div className="bg-green-600 text-white rounded-lg p-6">

            <h2 className="font-semibold">
              Delivered
            </h2>

            <p className="text-3xl font-bold mt-3">
              {delivered}
            </p>

          </div>

        </div>
                {/* Best Selling Products */}

        <div className="bg-white rounded-lg shadow p-6 mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Best Selling Products
          </h2>

          <table className="w-full border border-collapse">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-3">
                  Product
                </th>

                <th className="border p-3">
                  Price
                </th>

                <th className="border p-3">
                  Quantity Sold
                </th>

                <th className="border p-3">
                  Revenue
                </th>

              </tr>

            </thead>

            <tbody>

              {bestSellingProducts.map((product) => (

                  <tr key={product.id}>

                    <td className="border p-3">

                      <div className="flex items-center gap-3">

                        <img
                          src={product.image_url}
                          alt={product.name}
                          loading="lazy"
                          className="w-12 h-12 rounded object-cover"
                        />

                        <span>
                          {product.name}
                        </span>

                      </div>

                    </td>

                    <td className="border p-3">
                      ₹{product.price}
                    </td>

                    <td className="border p-3 font-semibold">
                      {product.quantitySold}
                    </td>

                    <td className="border p-3 text-green-600 font-bold">
                      ₹{product.revenue}
                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>
                {/* Low Stock Products */}

        <div className="bg-white rounded-lg shadow p-6 mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Low Stock Products
          </h2>

          <table className="w-full border border-collapse">

            <thead className="bg-gray-100">

              <tr>

                <th className="border p-3">
                  Product
                </th>

                <th className="border p-3">
                  Stock Left
                </th>

              </tr>

            </thead>

            <tbody>

              {lowStockProducts.map((product) => (

                  <tr key={product.id}>

                    <td className="border p-3">
                      {product.name}
                    </td>

                    <td
                      className={`border p-3 font-bold ${
                        product.stock === 0
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {product.stock}
                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

        {/* Recent Orders */}

        <div className="bg-white rounded-lg shadow p-6 mt-10 mb-10">

          <h2 className="text-2xl font-bold mb-6">
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

                <th className="border p-3">
                  Date
                </th>

              </tr>

            </thead>

            <tbody>

              {recentOrders.map((order) => (

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

                    <td className="border p-3">
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>
    </>
  );
}

export default SalesOverview;
