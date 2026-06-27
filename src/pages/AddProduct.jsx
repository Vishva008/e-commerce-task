import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

function AddProduct() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] =
    useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    getCategories();
  }, []);

  async function getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select("id, name");

    if (error) {
      console.error(error);
      return;
    }

    setCategories(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !categoryId ||
      !image
    ) {
      alert("Please fill all fields.");
      return;
    }

    const fileName =
      Date.now() + "-" + image.name;

    const { error: uploadError } =
      await supabase.storage
        .from("product-images")
        .upload(fileName, image);

    if (uploadError) {
      console.error(uploadError);
      alert("Image upload failed");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const { error } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price: Number(price),
          stock: Number(stock),
          category_id: Number(categoryId),
          image_url: publicUrl,
        },
      ]);

    if (error) {
      console.error(error);
      alert("Failed to add product.");
      return;
    }

    alert("Product Added Successfully");

    navigate("/admin");
  }

  return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">
          Add Product
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Product Name"
            className="border w-full p-3 rounded"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <textarea
            placeholder="Description"
            className="border w-full p-3 rounded"
            rows="4"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Price"
            className="border w-full p-3 rounded"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Stock"
            className="border w-full p-3 rounded"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value)
            }
          />

          <select
            className="border w-full p-3 rounded"
            value={categoryId}
            onChange={(e) =>
              setCategoryId(e.target.value)
            }
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files[0])
            }
          />

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-3 rounded"
          >
            Add Product
          </button>
        </form>
      </div>
    </>
  );
}

export default AddProduct;