"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import ImageWrapper from "./ImageWrapper";

interface ReviewCardProps {
  review: {
    id: string;
    text: string;
    rating: number;
    gameId: number;
    createdAt: Date;
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

  const formattedDate = new Date(review.createdAt).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="border p-3 rounded bg-gray-50 flex gap-4 items-start relative">
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

      <div className="flex flex-col justify-between flex-grow relative w-full pr-6">
        <div>
          {game ? (
            <Link href={`/game/${review.gameId}`} className="hover:underline">
              <h3 className="font-semibold">{game.name}</h3>
            </Link>
          ) : (
            <h3 className="font-semibold">Unknown Game</h3>
          )}
          <p className="text-sm mt-1 [overflow-wrap:anywhere]">{review.text}</p>

          <p className="text-xs text-gray-500 mt-2">
            Rating: {review.rating}/10 • {formattedDate}
          </p>
        </div>
      </div>
      <div className="absolute bottom-2 right-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer">
        <Heart size={20} />
      </div>
    </div>
  );
}
