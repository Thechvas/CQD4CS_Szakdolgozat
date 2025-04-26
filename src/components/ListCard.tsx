"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageWrapper from "./ImageWrapper";

interface ListCardProps {
  list: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    gameIds: number[];
  };
}

interface GameInfo {
  id: number;
  name: string;
  coverUrl: string;
}

export default function ListCard({ list }: ListCardProps) {
  const [games, setGames] = useState<GameInfo[]>([]);

  useEffect(() => {
    async function fetchGames() {
      if (list.gameIds.length === 0) return;

      const idsParam = list.gameIds.slice(0, 10).join(",");
      const res = await fetch(`/api/games/batch?ids=${idsParam}`);
      if (!res.ok) {
        console.error(`Failed to fetch games`);
        return;
      }
      const data = await res.json();
      setGames(data);
    }

    fetchGames();
  }, [list.gameIds]);

  return (
    <div className="border p-4 rounded-lg bg-gray-50 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">{list.name}</h3>
        <p className="text-xs text-gray-400">
          {new Date(list.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {games.length > 0 ? (
          games.map((game) => (
            <Link key={game.id} href={`/game/${game.id}`} className="shrink-0">
              <ImageWrapper
                src={game.coverUrl}
                alt={game.name}
                width={64}
                height={90}
              />
            </Link>
          ))
        ) : (
          <div className="text-gray-400 text-sm">No games yet.</div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-600 max-w-[70%]">{list.description}</p>
        <Link
          href={`/list/${list.id}`}
          className="text-blue-500 text-sm hover:underline whitespace-nowrap"
        >
          See more →
        </Link>
      </div>
    </div>
  );
}
