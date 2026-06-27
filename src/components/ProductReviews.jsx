import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [user, setUser] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (productId) {
      loadData();
    }
  }, [productId]);

  async function loadData() {
    const [
      {
        data: { user: currentUser },
      },
      reviewsResult,
    ] = await Promise.all([
      supabase.auth.getUser(),
      fetchReviews(),
    ]);

    setUser(currentUser);
    applyReviews(reviewsResult);
  }

  async function fetchReviews() {
    return supabase
      .from("reviews")
      .select("id, rating, comment, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
  }

  function applyReviews({ data, error }) {
    if (error) {
      console.error(error);
      return;
    }

    setReviews(data || []);

    if (data && data.length > 0) {
      const total = data.reduce(
        (sum, review) => sum + review.rating,
        0
      );

      setAverageRating((total / data.length).toFixed(1));
    } else {
      setAverageRating(0);
    }
  }

  async function getReviews() {
    applyReviews(await fetchReviews());
  }

  async function submitReview() {
    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a review.");
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .insert([
        {
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
        },
      ]);

    if (error) {
      console.error(error);
      alert("Failed to submit review.");
      return;
    }

    setComment("");
    setRating(5);

    getReviews();

    alert("Review submitted successfully.");
  }

  function renderStars(value) {
    return "★".repeat(value) + "☆".repeat(5 - value);
  }

 return (
  <div className="mt-12">
    <h2 className="text-3xl font-bold mb-4">
      Customer Reviews
    </h2>

    <div className="mb-8">
      <p className="text-3xl text-yellow-500">
        {renderStars(Math.round(averageRating))}
      </p>

      <p className="text-xl font-semibold">
        {averageRating} / 5
      </p>

      <p className="text-gray-500">
        {reviews.length} Review
        {reviews.length !== 1 && "s"}
      </p>
    </div>

    {user && (
      <div className="border rounded-lg p-6 mb-8">
        <h3 className="text-2xl font-semibold mb-4">
          Write a Review
        </h3>

        <label className="block mb-2 font-medium">
          Rating
        </label>

        <select
          value={rating}
          onChange={(e) =>
            setRating(Number(e.target.value))
          }
          className="border p-3 rounded w-full mb-4"
        >
          <option value={5}>★★★★★ (5)</option>
          <option value={4}>★★★★☆ (4)</option>
          <option value={3}>★★★☆☆ (3)</option>
          <option value={2}>★★☆☆☆ (2)</option>
          <option value={1}>★☆☆☆☆ (1)</option>
        </select>

        <textarea
          rows="4"
          placeholder="Write your review..."
          value={comment}
          onChange={(e) =>
            setComment(e.target.value)
          }
          className="border p-3 rounded w-full mb-4"
        />

        <button
          onClick={submitReview}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Submit Review
        </button>
      </div>
    )}

    {!user && (
      <div className="border rounded-lg p-6 mb-8 bg-gray-50">
        <p className="text-gray-600">
          Please login to write a review.
        </p>
      </div>
    )}

    {reviews.length === 0 ? (
      <p className="text-gray-500">
        No reviews yet.
      </p>
    ) : (
      reviews.map((review) => (
        <div
          key={review.id}
          className="border rounded-lg p-5 mb-4"
        >
          <div className="flex justify-between items-center">
            <span className="text-yellow-500 text-xl">
              {renderStars(review.rating)}
            </span>

            <span className="text-sm text-gray-500">
              {new Date(
                review.created_at
              ).toLocaleDateString()}
            </span>
          </div>

          <p className="mt-3 text-gray-700">
            {review.comment}
          </p>
        </div>
      ))
    )}
  </div>
);

}

export default ProductReviews;
