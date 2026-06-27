import { useParams } from "react-router-dom";
import {
  useEffect,
  useState,
  useContext,
  useMemo,
} from "react";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";
import { CartContext } from "../contexts/CartContext";
import ProductReviews from "../components/ProductReviews";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] =
    useState(null);

  const {
    cart,
    addToCart,
  } = useContext(CartContext);

  const alreadyInCart = useMemo(
    () =>
      cart.some(
        (item) =>
          Number(item.id) === Number(id)
      ),
    [cart, id]
  );

  useEffect(() => {
    getProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      document.title =
        `${product.name} | E-Shop`;

      const metaDescription =
        document.querySelector(
          'meta[name="description"]'
        );

      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          product.description ||
            "Product Details"
        );
      }
    }
  }, [product]);

  async function getProduct() {
    const { data, error } =
      await supabase
        .from("products")
        .select(
          "id, name, description, price, stock, image_url"
        )
        .eq("id", id)
        .single();

    if (error) {
      console.error(error);
      return;
    }

    setProduct(data);
  }

  function handleAddToCart() {
    if (product.stock <= 0) {
      alert(
        "This product is out of stock."
      );
      return;
    }

    if (alreadyInCart) {
      alert(
        "Product is already added to the cart."
      );
      return;
    }

    addToCart(product);
  }

  if (!product) {
    return (
      <h1 className="p-10">
        Loading...
      </h1>
    );
  }
    return (
    <>
      <Navbar />

      <div className="max-w-5xl mx-auto p-10">
        <img
          src={
            product.image_url ||
            "https://placehold.co/600x400?text=Product+Image"
          }
          alt={product.name}
          className="w-full h-96 object-cover rounded-lg"
        />

        <h1 className="text-4xl font-bold mt-6">
          {product.name}
        </h1>

        <p className="text-gray-600 mt-3">
          {product.description}
        </p>

        <p className="text-green-600 text-3xl font-bold mt-4">
          ₹{product.price}
        </p>

        {/* Stock Status */}

        {product.stock === 0 ? (
          <p className="mt-3 text-lg font-semibold text-red-600">
            ❌ Out of Stock
          </p>
        ) : product.stock <= 5 ? (
          <p className="mt-3 text-lg font-semibold text-orange-600">
            🔥 Only {product.stock} left!
          </p>
        ) : (
          <p className="mt-3 text-lg font-semibold text-green-600">
            ✅ In Stock
          </p>
        )}

        <button
          onClick={handleAddToCart}
          disabled={
            product.stock <= 0 ||
            alreadyInCart
          }
          className={`px-6 py-3 rounded mt-6 text-white transition ${
            product.stock <= 0
              ? "bg-gray-400 cursor-not-allowed"
              : alreadyInCart
              ? "bg-green-600 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          }`}
        >
          {product.stock <= 0
            ? "Out of Stock"
            : alreadyInCart
            ? "✓ Added to Cart"
            : "Add to Cart"}
        </button>

        {/* Reviews */}

        <ProductReviews productId={id} />
      </div>
    </>
  );
}

export default ProductDetails;