"use client";

import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReviewCardForGameProps {
  review: {
    id: string;
    text: string;
    rating: number;
    createdAt?: Date;
    updatedAt?: Date;
    user: {
      username: string;
      profilePic?: string | null;
    };
  };
}

export default function ReviewCardForGame({ review }: ReviewCardForGameProps) {
  const formattedDate = review.updatedAt
    ? new Date(review.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      })
    : null;

  return (
    <div className="border p-4 rounded bg-gray-50 flex flex-col sm:flex-row gap-4 sm:items-start relative hover:shadow-lg transition-shadow">
      <Link href={`/user/${review.user.username}`} className="shrink-0">
        <Image
          src={review.user.profilePic || "/default_profile.jpg"}
          alt={`${review.user.username}'s profile picture`}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
      </Link>

      <div className="flex flex-col flex-grow pr-6">
        <Link
          href={`/user/${review.user.username}`}
          className="hover:underline"
        >
          <h4 className="font-semibold">{review.user.username}</h4>
        </Link>

        <p className="text-gray-800 mb-2 whitespace-pre-wrap w-full [overflow-wrap:anywhere]">
          {review.text}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: review.rating }, (_, i) => (
              <Star key={i} size={16} fill="#FACC15" stroke="none" />
            ))}
          </div>
          <span className="text-gray-600">({review.rating}/10)</span>
          {formattedDate && (
            <span className="text-gray-400">• {formattedDate}</span>
          )}
        </div>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute bottom-2 right-3 text-gray-400 hover:text-red-500 transition-colors cursor-not-allowed">
              <Heart size={20} />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={4}>
            <p>Like feature coming soon</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
