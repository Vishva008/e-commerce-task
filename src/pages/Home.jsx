import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    document.title = "E-Shop | Home";
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, image_url");

    if (error) {
      console.error(error);
      return;
    }

    setProducts(data || []);
  }

  return (
    <>
      <Navbar />
      <Hero />

      <div className="grid md:grid-cols-3 gap-6 p-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </>
  );
}

export default Home;
