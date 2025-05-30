"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageWrapper from "./ImageWrapper";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquareMore } from "lucide-react";

interface ListCardProps {
  list: {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    gameIds: number[];
    comments: {
      text: string;
    }[];
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

  const visibleGames = games.slice(0, 3);
  const remainingCount = games.length - 3;
  return (
    <div className="border p-4 rounded-lg bg-white shadow-sm flex flex-col gap-4 transition hover:shadow-md">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="text-lg font-semibold whitespace-pre-wrap [overflow-wrap:anywhere]">
            <span>
              {list.name}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/list/${list.id}`}>
                      <span className="inline-flex items-center gap-1 ml-2 text-sm text-gray-500 hover:text-blue-600 transition align-baseline">
                        <MessageSquareMore className="w-4 h-4" />
                        <span>{list.comments.length}</span>
                      </span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Comments</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 whitespace-nowrap">
          {new Date(list.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto items-end">
        {visibleGames.length > 0 ? (
          <>
            {visibleGames.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="shrink-0 rounded-md overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <ImageWrapper
                  src={game.coverUrl}
                  alt={game.name}
                  width={64}
                  height={90}
                />
              </Link>
            ))}
            {remainingCount > 0 && (
              <div className="text-sm text-gray-500 self-end ml-1">
                ...and {remainingCount} more
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-sm">No games yet.</div>
        )}
      </div>

      <div className="flex justify-between items-center mt-2">
        <p className="text-sm text-gray-600 max-w-[70%] whitespace-pre-wrap [overflow-wrap:anywhere]">
          {list.description || "No description available"}
        </p>
        <Link
          href={`/list/${list.id}`}
          className="text-blue-600 text-sm hover:underline whitespace-nowrap"
        >
          See more →
        </Link>
      </div>
    </div>
  );
}
