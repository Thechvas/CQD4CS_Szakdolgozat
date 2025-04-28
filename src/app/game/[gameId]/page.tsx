import { fetchFromIGDB } from "@/lib/igdb";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GameDetails from "@/components/GameDetails";
import ReviewCardForGame from "@/components/ReviewCardForGame";
import { IGDBGame } from "@/types";
import ReviewFormForGameWrapper from "@/components/ReviewFormForGameWrapper";

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

  const session = await getServerSession(authOptions);
  let userReview = null;

  if (session?.user?.email) {
    userReview = await prisma.review.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
        gameId: Number(gameId),
      },
    });
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <GameDetails game={game} />

      <section className="mt-10">
        {session && (
          <section className="mt-10">
            <ReviewFormForGameWrapper gameId={Number(gameId)} />
          </section>
        )}
      </section>

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
