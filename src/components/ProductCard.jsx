import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`}>
      <div className="border rounded-xl p-4 shadow hover:shadow-lg transition">
        <img
          src={
            product.image_url ||
            "https://placehold.co/600x400?text=Product+Image"
          }
          alt={product.name}
          loading="lazy"
          className="w-full h-48 object-cover rounded-lg"
        />

        <h2 className="text-xl font-semibold mt-3">
          {product.name}
        </h2>

        <p className="text-gray-500">
          {product.description}
        </p>

        <p className="text-green-600 font-bold mt-2">
          ₹{product.price}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;
