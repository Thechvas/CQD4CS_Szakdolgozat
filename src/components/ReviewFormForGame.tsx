"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReviewFormForGameProps {
  gameId: number;
  existingReview?: {
    id: string;
    text: string;
    rating: number;
  };
  isSignedIn: boolean;
}

const MAX_CHARACTERS = 8000;

export default function ReviewFormForGame({
  gameId,
  existingReview,
  isSignedIn,
}: ReviewFormForGameProps) {
  const router = useRouter();
  const [text, setText] = useState(existingReview?.text || "");
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [loading, setLoading] = useState(false);

  if (!isSignedIn) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() === "" || rating < 1 || rating > 10) return;
    if (text.length > MAX_CHARACTERS) return;

    setLoading(true);

    await fetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({
        gameId,
        text,
        rating,
        reviewId: existingReview?.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setLoading(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    if (!confirm("Are you sure you want to delete your review?")) return;

    setLoading(true);

    await fetch(`/api/reviews/${existingReview.id}`, {
      method: "DELETE",
    });

    setText("");
    setRating(5);

    setLoading(false);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-4 rounded bg-white shadow-sm space-y-4"
    >
      <h3 className="text-lg font-semibold">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      <textarea
        className="w-full border rounded p-2"
        placeholder={`Share your thoughts (max ${MAX_CHARACTERS} characters)...`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        maxLength={MAX_CHARACTERS}
        required
      />

      <div className="text-sm text-gray-500 text-right">
        {text.length}/{MAX_CHARACTERS}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm">Rating:</label>
        <select
          className="border rounded p-1"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {existingReview ? "Update Review" : "Post Review"}
        </button>

        {existingReview && (
          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Review
          </button>
        )}
      </div>
    </form>
  );
}
