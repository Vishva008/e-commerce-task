import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    document.title = "Products | E-Shop";
  }, []);

  async function loadData() {
    const [
      { data: productsData, error: productsError },
      { data: categoriesData, error: categoriesError },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, description, price, image_url, category_id"),
      supabase.from("categories").select("id, name"),
    ]);

    if (productsError) {
      console.error(productsError);
    } else {
      setProducts(productsData || []);
    }

    if (categoriesError) {
      console.error(categoriesError);
    } else {
      setCategories(categoriesData || []);
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch = product.name
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesCategory =
          selectedCategory === "All"
            ? true
            : product.category_id === selectedCategory;

        return matchesSearch && matchesCategory;
      }),
    [products, search, selectedCategory]
  );

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">
          All Products
        </h1>

        <input
          type="text"
          placeholder="Search products..."
          className="border p-3 w-full rounded-lg mb-6"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() =>
              setSelectedCategory("All")
            }
            className={`px-5 py-2 rounded-full ${
              selectedCategory === "All"
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(
                  category.id
                )
              }
              className={`px-5 py-2 rounded-full ${
                selectedCategory ===
                category.id
                  ? "bg-black text-white"
                  : "bg-gray-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <h2 className="text-xl text-gray-500">
            No products found.
          </h2>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Products;
