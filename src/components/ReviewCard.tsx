"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ReviewCardProps {
  review: {
    id: string;
    text: string;
    rating: number;
    gameId: number;
  };
}

interface GameInfo {
  name: string;
  coverUrl: string;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [game, setGame] = useState<GameInfo | null>(null);

  useEffect(() => {
    async function fetchGame() {
      const res = await fetch(`/api/games/${review.gameId}`);
      if (!res.ok) {
        console.error("Game not found for ID:", review.gameId);
        return;
      }
      const data = await res.json();
      setGame(data);
    }

    fetchGame();
  }, [review.gameId]);

  return (
    <div className="border p-3 rounded bg-gray-50 flex gap-4 items-start">
      {game?.coverUrl ? (
        <Link href={`/game/${review.gameId}`} className="shrink-0">
          <Image
            src={game.coverUrl}
            alt={game.name || "Game Cover"}
            width={64}
            height={90}
            className="rounded-md object-cover"
          />
        </Link>
      ) : (
        <div className="w-[64px] h-[90px] bg-gray-300 rounded-md" />
      )}

      <div>
        {game ? (
          <Link href={`/game/${review.gameId}`} className="hover:underline">
            <h3 className="font-semibold">{game.name}</h3>
          </Link>
        ) : (
          <h3 className="font-semibold">Unknown Game</h3>
        )}

        <p className="text-sm mt-1">{review.text}</p>
        <p className="text-xs text-gray-500 mt-2">Rating: {review.rating}/10</p>
      </div>
    </div>
  );
}
