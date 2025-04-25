import { fetchFromIGDB } from "@/lib/igdb";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GameDetails from "@/components/GameDetails";
import { IGDBGame } from "@/types";
import ReviewCardForGame from "@/components/ReviewCardForGame";

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const { gameId } = await params;

  const data: IGDBGame[] = await fetchFromIGDB(
    "games",
    `
    fields name, summary, first_release_date, cover.image_id, genres.name, platforms.name, themes.name, game_modes.name, involved_companies.company.name;
    where id = ${gameId};
  `
  );
  const game = data[0];
  if (!game) return notFound();

  const reviews = await prisma.review.findMany({
    where: {
      gameId: Number(gameId),
    },
    include: {
      user: {
        select: { username: true, profilePic: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <GameDetails game={game} />

      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">User Reviews</h2>

        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCardForGame
                  review={{
                    ...review,
                    createdAt: review.createdAt.toISOString(),
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to review!
          </p>
        )}
      </section>
    </main>
  );
}
