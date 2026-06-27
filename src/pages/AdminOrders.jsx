import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

function AdminOrders() {
  const [orders, setOrders] = useState([]);

const [searchId, setSearchId] =
  useState("");

const [searchEmail, setSearchEmail] =
  useState("");

const [statusFilter, setStatusFilter] =
  useState("All");

  useEffect(() => {
    getOrders();
  }, []);

  async function getOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select("id, email, total_amount, status, created_at")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setOrders(data || []);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase
      .from("orders")
      .update({
        status,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to update order");
      return;
    }

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order
      )
    );

    alert("Order Updated Successfully");
  }

  function getStatusColor(status) {
    switch (status) {
      case "Placed":
        return "bg-yellow-100 text-yellow-800";

      case "Processing":
        return "bg-blue-100 text-blue-800";

      case "Shipped":
        return "bg-purple-100 text-purple-800";

      case "Delivered":
        return "bg-green-100 text-green-800";

      default:
        return "bg-gray-100";
    }
  }
  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesId =
          searchId === "" ||
          order.id
            .toString()
            .includes(searchId);

        const matchesEmail =
          searchEmail === "" ||
          order.email
            .toLowerCase()
            .includes(
              searchEmail.toLowerCase()
            );

        const matchesStatus =
          statusFilter === "All" ||
          order.status === statusFilter;

        return (
          matchesId &&
          matchesEmail &&
          matchesStatus
        );
      }),
    [orders, searchId, searchEmail, statusFilter]
  );
    return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">
            Manage Orders
          </h1>

          <Link
            to="/admin"
            className="bg-gray-700 text-white px-5 py-3 rounded hover:bg-gray-800"
          >
            ← Back to Admin
          </Link>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

  <input
    type="text"
    placeholder="Search Order ID"
    value={searchId}
    onChange={(e) =>
      setSearchId(e.target.value)
    }
    className="border p-3 rounded"
  />

  <input
    type="text"
    placeholder="Customer Email"
    value={searchEmail}
    onChange={(e) =>
      setSearchEmail(e.target.value)
    }
    className="border p-3 rounded"
  />

  <select
    value={statusFilter}
    onChange={(e) =>
      setStatusFilter(e.target.value)
    }
    className="border p-3 rounded"
  >
    <option value="All">
      All Status
    </option>

    <option value="Placed">
      Placed
    </option>

    <option value="Processing">
      Processing
    </option>

    <option value="Shipped">
      Shipped
    </option>

    <option value="Delivered">
      Delivered
    </option>

  </select>

  <button
    onClick={() => {
      setSearchId("");
      setSearchEmail("");
      setStatusFilter("All");
    }}
    className="bg-red-600 text-white px-4 py-3 rounded hover:bg-red-700"
  >
    Clear Filters
  </button>

</div>
        <table className="w-full border border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-3">Order ID</th>
              <th className="border p-3">Customer</th>
              <th className="border p-3">Total</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Date</th>
              <th className="border p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td className="border p-3">
                  #{order.id}
                </td>

                <td className="border p-3">
                  {order.email}
                </td>

                <td className="border p-3">
                  ₹{order.total_amount}
                </td>

                <td className="border p-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(
                        order.id,
                        e.target.value
                      )
                    }
                    className={`px-3 py-2 rounded font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    <option value="Placed">
                      Placed
                    </option>

                    <option value="Processing">
                      Processing
                    </option>

                    <option value="Shipped">
                      Shipped
                    </option>

                    <option value="Delivered">
                      Delivered
                    </option>
                  </select>
                </td>

                <td className="border p-3">
                  {new Date(
                    order.created_at
                  ).toLocaleString()}
                </td>

                <td className="border p-3">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
  <div className="text-center py-10 text-gray-500 text-xl font-semibold">
    No Orders Found
  </div>
)}
      </div>
    </>
  );
}

export default AdminOrders;