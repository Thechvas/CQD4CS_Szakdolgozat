import GameCard from "@/components/GameCard";
import { getTopRatedGames } from "@/lib/igdb-utils";

export default async function TopRatedPage() {
  const games = await getTopRatedGames(100);

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">⭐ Top Rated Games</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {games.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            name={game.name}
            imageId={game.cover?.image_id}
          />
        ))}
      </div>
    </main>
  );
}
