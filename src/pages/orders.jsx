import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { useNavigate, Link } from "react-router-dom";

function Orders() {

  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getOrders();
  }, []);

  useEffect(() => {
  document.title = "My Orders | E-Shop";
}, []);

  async function getOrders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate("/login");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id, status, total_amount, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setOrders(data);
  }

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
            >
              <div className="border rounded-lg p-5 mb-4 hover:bg-gray-50">
                <h2 className="text-xl font-semibold">
                  Order #{order.id}
                </h2>

                <p className="mt-2">
                  Status:
                  <span className="font-semibold ml-2">
                    {order.status}
                  </span>
                </p>

                <p className="mt-2">
                  Amount:
                  <span className="font-semibold ml-2">
                    ₹{order.total_amount}
                  </span>
                </p>

                <p className="mt-2 text-gray-500">
                  {new Date(
                    order.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}

export default Orders;