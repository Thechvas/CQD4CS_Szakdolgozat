"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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
  const submittedRef = useRef(false);

  if (!isSignedIn) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submittedRef.current) return;
    submittedRef.current = true;

    if (
      text.trim() === "" ||
      rating < 1 ||
      rating > 10 ||
      text.length > MAX_CHARACTERS
    ) {
      submittedRef.current = false;
      return;
    }

    setLoading(true);
    const toastId = toast.loading(
      existingReview ? "Updating review..." : "Posting review..."
    );

    try {
      const res = await fetch("/api/reviews", {
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

      if (!res.ok) throw new Error();

      toast.success(existingReview ? "Review updated!" : "Review posted!", {
        id: toastId,
      });

      setLoading(false);
      submittedRef.current = false;
      router.refresh();
    } catch {
      toast.error("Something went wrong. Try again.", { id: toastId });
      setLoading(false);
      submittedRef.current = false;
    }
  };

  const handleDelete = async () => {
    if (
      !existingReview ||
      !confirm("Are you sure you want to delete your review?")
    )
      return;

    setLoading(true);
    const toastId = toast.loading("Deleting review...");

    try {
      const res = await fetch(`/api/reviews/${existingReview.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("Review deleted!", { id: toastId });
      setText("");
      setRating(5);
      router.refresh();
    } catch {
      toast.error("Failed to delete review.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-6 rounded bg-white shadow-sm space-y-5"
    >
      <h3 className="text-lg font-semibold">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      <div>
        <Textarea
          id="review"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_CHARACTERS}
          rows={6}
          placeholder="Share your thoughts..."
          className="text-lg leading-relaxed placeholder:text-gray-400"
          required
        />
        <div className="text-sm text-right text-gray-400 mt-1">
          {text.length}/{MAX_CHARACTERS} characters
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-600">Your Rating:</span>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {[...Array(10)].map((_, i) => {
            const value = i + 1;
            return (
              <button
                type="button"
                key={value}
                onClick={() => setRating(value)}
                className={`transition ${
                  value <= rating ? "text-yellow-500" : "text-gray-300"
                }`}
              >
                <Star size={20} fill={value <= rating ? "#FACC15" : "none"} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={loading || submittedRef.current}>
          {loading ? (
            <div className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              {existingReview ? "Updating..." : "Posting..."}
            </div>
          ) : (
            <>{existingReview ? "Update Review" : "Post Review"}</>
          )}
        </Button>

        {existingReview && (
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            Delete Review
          </Button>
        )}
      </div>
    </form>
  );
}
