import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    getOrderDetails();
  }, [id]);

  async function getOrderDetails() {
    const [
      { data: orderData, error: orderError },
      { data: paymentData, error: paymentError },
      { data: itemData, error: itemError },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("id", id)
        .single(),

      supabase
        .from("payments")
        .select("payment_method, payment_status, transaction_id")
        .eq("order_id", id)
        .single(),

      supabase
        .from("order_items")
        .select(`
          id,
          quantity,
          price,
          products:product_id(
            id,
            name,
            description,
            image_url
          )
        `)
        .eq("order_id", Number(id)),
    ]);

    if (orderError) {
      console.error(orderError);
      return;
    }

    setOrder(orderData);

    // Get Payment Details
    if (paymentError && paymentError.code !== "PGRST116") {
      console.error(paymentError);
    } else {
      setPayment(paymentData);
    }

    // Get Order Items
    if (itemError) {
      console.error(itemError);
      return;
    }

    setItems(itemData || []);
  }

  function getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "placed":
        return "bg-yellow-100 text-yellow-800";

      case "processing":
        return "bg-blue-100 text-blue-800";

      case "shipped":
        return "bg-purple-100 text-purple-800";

      case "delivered":
        return "bg-green-100 text-green-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  function getPaymentColor(status) {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  const steps = [
    "Placed",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const currentStep = steps.findIndex(
    (step) =>
      step.toLowerCase() ===
      order?.status?.toLowerCase()
  );

  if (!order) {
    return <h1 className="p-10">Loading...</h1>;
  }

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">
          Order #{order.id}
        </h1>

        <div className="border rounded-lg p-6 mb-6">

          <div className="flex items-center gap-3">
            <strong>Status:</strong>

            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>

          <p className="mt-4">
            <strong>Total:</strong> ₹{order.total_amount}
          </p>

          <p className="mt-2 text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </p>

          {/* Payment Details */}

          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">
              Payment Details
            </h3>

            <p className="mb-2">
  <strong>Payment Method:</strong>{" "}
  {payment?.payment_method || "Not Available"}
</p>

            <div className="flex items-center gap-3 mb-2">
              <strong>Payment Status:</strong>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentColor(
                  payment?.payment_status
                )}`}
              >
                {payment?.payment_status ?? "Pending"}
              </span>
            </div>

           {payment?.payment_method !== "Cash on Delivery" &&
  payment?.transaction_id && (
    <p>
      <strong>Transaction ID:</strong>{" "}
      {payment.transaction_id}
    </p>
)}
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-6">
              Order Progress
            </h3>

            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const completed = index < currentStep;
                const current = index === currentStep;

                return (
                  <div
                    key={step}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        completed
                          ? "bg-green-500 text-white"
                          : current
                          ? "bg-blue-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    <p className="mt-2 text-sm font-medium">
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <h2 className="text-2xl font-bold mb-4">
          Products
        </h2>

        <p className="mb-4">
          Items Count: {items.length}
        </p>

        {items.length === 0 ? (
          <p>No products found for this order.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 mb-4 flex gap-4"
            >
              <img
                src={
                  item.products?.image_url ||
                  "https://placehold.co/150x150?text=Product"
                }
                alt={item.products?.name}
                loading="lazy"
                className="w-32 h-32 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="text-xl font-semibold">
                  {item.products?.name}
                </h3>

                <p className="text-gray-600 mt-1">
                  {item.products?.description}
                </p>

                <p className="mt-3">
                  Quantity: {item.quantity}
                </p>

                <p>
                  Price: ₹{item.price}
                </p>

                <p className="font-semibold text-green-600">
                  Subtotal: ₹
                  {Number(item.price) * item.quantity}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default OrderDetails;