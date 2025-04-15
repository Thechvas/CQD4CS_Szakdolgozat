'use client';

import { useEffect, useState } from 'react';

interface Game {
  id: number;
  name: string;
  rating: number;
  rating_count: number;
  cover?: {
    url: string;
  };
}

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function fetchGames() {
      const res = await fetch('/api/igdb');
      const data = await res.json();
      setGames(data);
    }

    fetchGames();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🎯 Top Rated Games</h1>
      <ul className="space-y-4">
        {games.map((game) => (
          <li key={game.id} className="flex items-center space-x-4">
            {game.cover && (
              <img
                src={game.cover.url.replace('//', 'https://')}
                alt={game.name}
                width={100}
                className="rounded"
              />
            )}
            <div>
              <p className="font-semibold">{game.name}</p>
              <p className="text-sm text-gray-500">
                Score: {Math.round(game.rating)} / 100<br />
                Reviews: {game.rating_count}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
