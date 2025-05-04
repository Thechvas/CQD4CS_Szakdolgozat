import { fetchFromIGDB } from "@/lib/igdb";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import GameDetails from "@/components/GameDetails";
import ReviewCardForGame from "@/components/ReviewCardForGame";
import { IGDBGame } from "@/types";
import ReviewFormForGameWrapper from "@/components/ReviewFormForGameWrapper";
import AddToList from "@/components/AddToList";

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

  const totalReviewCount = await prisma.review.count({
    where: {
      gameId: Number(gameId),
    },
  });

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg space-y-10">
      <div className="space-y-6">
        <GameDetails game={game} />
        <AddToList gameId={game.id} />
      </div>

      {session && (
        <div>
          <ReviewFormForGameWrapper gameId={Number(gameId)} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">
          User Reviews ({totalReviewCount})
        </h2>
        {reviews.length > 0 ? (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCardForGame review={review} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
}
