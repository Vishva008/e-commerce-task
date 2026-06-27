import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="text-5xl font-bold text-green-600">
          Order Placed Successfully!
        </h1>

        <p className="mt-4 text-lg">
          Thank you for shopping with Astro Shop.
        </p>

        <Link
          to="/"
          className="bg-black text-white px-6 py-3 rounded mt-6"
        >
          Continue Shopping
        </Link>
      </div>
    </>
  );
}

export default OrderSuccess;