"use client";

import Link from "next/link";

interface GameCardProps {
  id: number;
  name: string;
  imageId?: string;
}

export default function GameCard({ id, name, imageId }: GameCardProps) {
  const imageUrl = imageId
    ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`
    : "/placeholder-image.jpg";

  return (
    <Link href={`/game/${id}`}>
      <div className="w-40 sm:w-48 flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 bg-white cursor-pointer">
        <div className="h-60">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-center p-3 h-20">
          <h2 className="text-sm sm:text-base font-semibold text-center line-clamp-2">
            {name}
          </h2>
        </div>
      </div>
    </Link>
  );
}
