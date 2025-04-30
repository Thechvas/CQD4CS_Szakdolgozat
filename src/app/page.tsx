import Link from "next/link";
import GameCard from "@/components/GameCard";
import WelcomeBanner from "@/components/WelcomeBanner";
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

  const Section = ({
    title,
    games,
    link,
  }: {
    title: string;
    games: any[];
    link: string;
  }) => (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <Link
          href={link}
          className="text-blue-600 hover:underline text-base font-medium"
        >
          See More →
        </Link>
      </div>
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
    </section>
  );

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <WelcomeBanner />
      <Section title="🎯 Top Rated Games" games={topRated} link="/top-rated" />
      <Section
        title="🔥 Most Played Games"
        games={mostPlayed}
        link="/most-played"
      />
      <Section
        title="🆕 Recently Released Games"
        games={recentlyReleased}
        link="/recently-released"
      />
    </main>
  );
}
