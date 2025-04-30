import GameCard from "@/components/GameCard";
import { getMostPlayedGames } from "@/lib/igdb-utils";

export const metadata = {
  title: "Most Played Games | GameVault",
  description: "Browse the 100 most played games by the community.",
};

export default async function MostPlayedPage() {
  const mostPlayedGames = await getMostPlayedGames(100);

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">🔥 Most Played Games</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {mostPlayedGames.map((game) => (
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
