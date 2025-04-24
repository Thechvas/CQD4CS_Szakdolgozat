import { fetchFromIGDB } from "@/lib/igdb";
import { notFound } from "next/navigation";
import GameDetails from "@/components/GameDetails";
import { IGDBGame } from "@/types";

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const { gameId } = await params;
  // ✅ Make sure this function is `async` and you're using `params.gameId` inside it
  const data: IGDBGame[] = await fetchFromIGDB(
    "games",
    `
    fields name, summary, first_release_date, cover.image_id, genres.name, platforms.name, themes.name, game_modes.name, involved_companies.company.name;
    where id = ${gameId};
  `
  );

  const game = data[0];

  if (!game) return notFound();

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <GameDetails game={game} />
    </main>
  );
}
