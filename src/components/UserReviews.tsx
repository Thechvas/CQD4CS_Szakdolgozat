"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReviewCard from "./ReviewCard";

interface Review {
  id: string;
  text: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  gameId: number;
  userId: string;
}

interface Props {
  username: string;
  reviewsPerPage?: number;
}

export default function UserReviews({ username, reviewsPerPage = 3 }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(total / reviewsPerPage);
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/reviews/by-user/${username}?page=${page}&perPage=${reviewsPerPage}`
      );
      const data = await res.json();
      setReviews(data.reviews);
      setTotal(data.total);
      setLoading(false);
    };

    fetchReviews();
  }, [page, username, reviewsPerPage]);

  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div ref={reviewSectionRef}>
      <h2 className="text-xl font-semibold mb-2">Reviews ({total})</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : reviews.length > 0 ? (
        <>
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>

          <div className="flex justify-center mt-4 items-center space-x-4">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-full border transition ${
                page === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className={`p-2 rounded-full border transition ${
                page === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No reviews yet.</p>
      )}
    </div>
  );
}
