import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [
      { data: categoriesData, error: categoriesError },
      { data: productData, error: productError },
    ] = await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .order("id"),
      supabase
        .from("products")
        .select("name, description, price, stock, category_id, image_url")
        .eq("id", id)
        .single(),
    ]);

    if (categoriesError) {
      console.error(categoriesError);
    } else {
      setCategories(categoriesData || []);
    }

    if (productError) {
      console.error(productError);
      return;
    }

    setName(productData.name);
    setDescription(productData.description);
    setPrice(productData.price);
    setStock(productData.stock);
    setCategoryId(productData.category_id);
    setImageUrl(productData.image_url);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    let finalImageUrl = imageUrl;

    if (image) {
      const fileName =
        Date.now() + "-" + image.name;

      const { error: uploadError } =
        await supabase.storage
          .from("product-images")
          .upload(fileName, image);

      if (uploadError) {
        alert(uploadError.message);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      finalImageUrl = publicUrl;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category_id: Number(categoryId),
        image_url: finalImageUrl,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Failed to update product");
      return;
    }

    alert("Product Updated Successfully");

    navigate("/admin");
  }
    return (
    <>
      <Navbar />

      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8">
          Edit Product
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

          <div>
            <p className="font-semibold mb-2">
              Current Image
            </p>

            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              className="w-48 h-48 object-cover rounded border"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Change Image (Optional)
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files[0])
              }
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
            >
              Update Product
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin")
              }
              className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditProduct;