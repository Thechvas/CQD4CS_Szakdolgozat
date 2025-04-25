"use client";

import Image from "next/image";
import Link from "next/link";

interface ReviewCardForGameProps {
  review: {
    id: string;
    text: string;
    rating: number;
    createdAt?: string;
    user: {
      username: string;
      profilePic?: string | null;
    };
  };
}

export default function ReviewCardForGame({ review }: ReviewCardForGameProps) {
  return (
    <div className="border p-4 rounded bg-gray-50 flex gap-4 items-start">
      <Link href={`/user/${review.user.username}`} className="shrink-0">
        <Image
          src={review.user.profilePic || "/default_profile.jpg"}
          alt={`${review.user.username}'s profile picture`}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
      </Link>

      <div>
        <Link
          href={`/user/${review.user.username}`}
          className="hover:underline"
        >
          <h4 className="font-semibold">{review.user.username}</h4>
        </Link>

        <p className="text-sm mt-1">{review.text}</p>

        <p className="text-xs text-gray-500 mt-2">
          Rating: {review.rating}/10
          {review.createdAt &&
            ` • ${new Date(review.createdAt).toLocaleDateString()}`}
        </p>
      </div>
    </div>
  );
}
