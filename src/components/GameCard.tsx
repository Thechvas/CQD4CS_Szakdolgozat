"use client";

import Link from "next/link";
import ImageWrapperGameCard from "./ImageWrapperGameCard";

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
      <div className="flex flex-col justify-between rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 bg-white cursor-pointer h-full">
        <ImageWrapperGameCard src={imageUrl} alt={name} />
        <div className="flex items-center justify-center p-3 h-20">
          <h2 className="text-sm sm:text-base font-semibold text-center line-clamp-2 leading-snug">
            {name}
          </h2>
        </div>
      </div>
    </Link>
  );
}
