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
      <div className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-200 bg-white cursor-pointer">
        <img src={imageUrl} alt={name} className="w-full h-72 object-cover" />
        <div className="p-4">
          <h2 className="text-lg font-semibold text-center truncate">{name}</h2>
        </div>
      </div>
    </Link>
  );
}
