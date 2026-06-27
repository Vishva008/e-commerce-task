import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

function ManageProducts()  {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  async function getProducts() {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        price,
        stock,
        image_url,
        categories (
          name
        )
      `)
      .order("id");

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  }

  async function deleteProduct(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to delete product");
      return;
    }

    alert("Product Deleted Successfully");

    getProducts();
  }

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-4xl font-bold">
            Manage Products
          </h1>

          <div className="flex gap-4">

            <Link
              to="/admin/orders"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Manage Orders
            </Link>

            <Link
              to="/admin/add-product"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              + Add Product
            </Link>

          </div>

        </div>

        <table className="w-full border border-collapse">

          <thead className="bg-gray-100">

            <tr>
              <th className="border p-3">ID</th>
              <th className="border p-3">Image</th>
              <th className="border p-3">Product</th>
              <th className="border p-3">Category</th>
              <th className="border p-3">Price</th>
              <th className="border p-3">Stock</th>
              <th className="border p-3">Actions</th>
            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr key={product.id}>

                <td className="border p-3">
                  {product.id}
                </td>

                <td className="border p-3">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    loading="lazy"
                    className="w-16 h-16 rounded object-cover"
                  />
                </td>

                <td className="border p-3">
                  {product.name}
                </td>

                <td className="border p-3">
                  {product.categories?.name}
                </td>

                <td className="border p-3">
                  ₹{product.price}
                </td>

                <td className="border p-3">
                  {product.stock}
                </td>

                <td className="border p-3">

                  <Link
                    to={`/admin/edit-product/${product.id}`}
                    className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() =>
                      deleteProduct(product.id)
                    }
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>
    </>
  );
}

export default ManageProducts;