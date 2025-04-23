import { notFound } from "next/navigation";
import { fetchFromIGDB } from "@/lib/igdb";
import GameDetails from "@/components/GameDetails";
import { IGDBGame } from "@/types";

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const data: IGDBGame[] = await fetchFromIGDB(
    "games",
    `
    fields name, summary, first_release_date, cover.image_id,
    genres.name, themes.name, platforms.name, game_modes.name,
    involved_companies.company.name;

    where id = ${params.gameId};
  `
  );

  const game = data[0];
  if (!game) return notFound();

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <GameDetails game={game} />
    </main>
  );
}
