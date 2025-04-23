import GameCard from "@/components/GameCard";
import {
  getTopRatedGames,
  getMostPlayedGames,
  getRecentlyReleasedGames,
} from "@/lib/igdb-utils";

export default async function HomePage() {
  const [topRated, mostPlayed, recentlyReleased] = await Promise.all([
    getTopRatedGames(),
    getMostPlayedGames(),
    getRecentlyReleasedGames(),
  ]);

  const Section = ({ title, games }: { title: string; games: any[] }) => (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            id={game.id}
            name={game.name}
            imageId={game.cover?.image_id}
          />
        ))}
      </div>
    </section>
  );

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10">🎮 Welcome to GameVault</h1>
      <Section title="🎯 Top Rated Games" games={topRated} />
      <Section title="🔥 Most Played Games" games={mostPlayed} />
      <Section title="🆕 Recently Released Games" games={recentlyReleased} />
    </main>
  );
}
