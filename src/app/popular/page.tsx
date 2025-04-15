'use client';

import { useEffect, useState } from 'react';

interface Game {
  id: number;
  name: string;
  summary?: string;
  cover?: {
    url: string;
  };
}

export default function SteamPopular() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function fetchGames() {
      const res = await fetch('/api/popular');
      const data = await res.json();
      setGames(data);
    }

    fetchGames();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🎮 Top Steam Games (24hr Peak Players)</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.map((game) => (
          <div key={game.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition">
            {game.cover && (
              <img
                src={game.cover.url.replace('//', 'https://')}
                alt={game.name}
                className="w-full h-auto object-cover"
              />
            )}
            <div className="p-3">
              <h2 className="text-base font-semibold">{game.name}</h2>
              {game.summary && (
                <p className="text-sm text-gray-500 mt-1">{game.summary.slice(0, 60)}...</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
