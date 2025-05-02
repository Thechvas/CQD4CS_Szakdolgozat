"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import ImageWrapper from "./ImageWrapper";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface ReviewCardProps {
  review: {
    id: string;
    text: string;
    rating: number;
    gameId: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

interface GameInfo {
  id: number;
  name: string;
  coverUrl: string;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [game, setGame] = useState<GameInfo | null>(null);

  useEffect(() => {
    async function fetchGame() {
      if (!review.gameId) return;

      const res = await fetch(`/api/games/batch?ids=${review.gameId}`);
      if (!res.ok) {
        console.error("Game not found for ID:", review.gameId);
        return;
      }
      const data = await res.json();
      if (data.length > 0) {
        setGame(data[0]);
      } else {
        console.error("Game not found for ID:", review.gameId);
      }
    }

    fetchGame();
  }, [review.gameId]);

  const formattedDate = new Date(review.updatedAt).toLocaleDateString(
    undefined,
    { year: "numeric", month: "numeric", day: "numeric" }
  );

  return (
    <div className="border p-4 rounded bg-gray-50 flex flex-col sm:flex-row gap-4 relative hover:shadow-lg transition-shadow">
      {game?.coverUrl ? (
        <Link href={`/game/${review.gameId}`} className="shrink-0">
          <ImageWrapper
            src={game.coverUrl}
            alt={game.name || "Game Cover"}
            width={64}
            height={90}
          />
        </Link>
      ) : (
        <div className="w-[64px] h-[90px] bg-gray-300 rounded-md" />
      )}

      <div className="flex flex-col justify-between flex-grow pr-6 w-full">
        <div>
          {game ? (
            <Link href={`/game/${review.gameId}`} className="hover:underline">
              <h3 className="font-semibold">{game.name}</h3>
            </Link>
          ) : (
            <h3 className="font-semibold">Unknown Game</h3>
          )}

          <p className="text-base mt-1 text-gray-800 break-words">
            {review.text}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: review.rating }, (_, i) => (
                <Star key={i} size={16} fill="#FACC15" stroke="none" />
              ))}
            </div>
            <span className="text-gray-600">({review.rating}/10)</span>
            <span className="text-gray-400">• {formattedDate}</span>
          </div>
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
