import { useContext, useEffect, useMemo } from "react";
import { CartContext } from "../contexts/CartContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Checkout() {
  useEffect(() => {
    document.title = "Checkout | E-Shop";
  }, []);

  const { cart, clearCart } =
    useContext(CartContext);

  const navigate = useNavigate();

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price) * item.quantity,
        0
      ),
    [cart]
  );

  async function placeOrder() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      // Check stock for every cart item in a single request instead of
      // one request per item
      const productIds = cart.map((item) => item.id);

      const { data: stockData, error: stockError } =
        await supabase
          .from("products")
          .select("id, stock")
          .in("id", productIds);

      if (stockError) {
        console.error(stockError);
        alert("Unable to verify stock.");
        return;
      }

      const stockById = new Map(
        (stockData || []).map((product) => [
          product.id,
          product.stock,
        ])
      );

      for (const item of cart) {
        const availableStock = stockById.get(item.id) ?? 0;

        if (availableStock < item.quantity) {
          alert(
            `${item.name} has only ${availableStock} item(s) left in stock.`
          );
          return;
        }
      }

      // Create Order
      const {
        data: order,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            email: user.email,
            total_amount: total,
            status: "Placed",
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error(orderError);
        alert("Failed to create order");
        return;
      }

      // ==========================
      // Save Payment + Order Items
      // ==========================
      // These two writes are independent of each other, so they run
      // in parallel instead of one after another.

      const transactionId =
        "TXN-" + Date.now();

      const orderItems = cart.map(
        (item) => ({
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })
      );

      const [
        { error: paymentError },
        { error: itemError },
      ] = await Promise.all([
        supabase.from("payments").insert([
          {
            order_id: order.id,
            user_id: user.id,
            amount: total,
            payment_method: "Cash on Delivery",
            payment_status: "Pending",
            transaction_id: transactionId,
          },
        ]),
        supabase.from("order_items").insert(orderItems),
      ]);

      if (paymentError) {
        console.error(paymentError);
        alert("Failed to save payment");
        return;
      }

      if (itemError) {
        console.error(itemError);
        alert("Failed to save order items");
        return;
      }

      // Reduce Product Stock — reuse the stock already fetched above
      // instead of re-querying it, and run the updates in parallel.
      const stockUpdateResults = await Promise.all(
        cart.map((item) => {
          const currentStock = stockById.get(item.id) ?? 0;
          const newStock = currentStock - item.quantity;

          return supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
        })
      );

      stockUpdateResults.forEach(({ error }) => {
        if (error) {
          console.error(error);
        }
      });

      // Clear Cart
      await clearCart();

      alert("Order Placed Successfully");

      navigate("/success");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">
          Checkout
        </h1>

        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Order Summary
          </h2>

          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between mb-3"
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <span>
                ₹
                {item.price * item.quantity}
              </span>
            </div>
          ))}

          <hr className="my-4" />

          <h3 className="text-2xl font-bold">
            Total: ₹{total}
          </h3>

          <button
            onClick={placeOrder}
            className="bg-green-600 text-white px-6 py-3 rounded mt-6 hover:bg-green-700"
          >
            Place Order
          </button>
        </div>
      </div>
    </>
  );
}

export default Checkout;
