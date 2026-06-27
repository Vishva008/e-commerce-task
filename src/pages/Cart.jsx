import { useContext, useEffect, useMemo } from "react";
import { CartContext } from "../contexts/CartContext";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function Cart() {

  useEffect(() => {
  document.title = "Shopping Cart | E-Shop";
}, []);

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useContext(CartContext);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price) * item.quantity,
        0
      ),
    [cart]
  );

  return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {cart.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 mb-4"
              >
                <h2 className="font-semibold text-xl">
                  {item.name}
                </h2>

                <p className="mt-2">
                  Price: ₹{item.price}
                </p>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() =>
                      decreaseQuantity(item.id)
                    }
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    -
                  </button>

                  <span className="font-bold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      increaseQuantity(item.id)
                    }
                    className="bg-gray-300 px-4 py-2 rounded"
                  >
                    +
                  </button>
                </div>

                <p className="mt-4 font-semibold">
                  Subtotal: ₹
                  {item.price * item.quantity}
                </p>

                <button
                  onClick={() =>
                    removeFromCart(item.id)
                  }
                  className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="mt-6 text-2xl font-bold">
              Total: ₹{total}
            </div>

            <Link
              to="/checkout"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded mt-6"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </>
  );
}

export default Cart;