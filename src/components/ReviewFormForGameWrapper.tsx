import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReviewFormForGame from "@/components/ReviewFormForGame";

interface ReviewFormForGameWrapperProps {
  gameId: number;
}

export default async function ReviewFormForGameWrapper({
  gameId,
}: ReviewFormForGameWrapperProps) {
  const session = await getServerSession(authOptions);

  let userReview = null;

  if (session?.user?.email) {
    userReview = await prisma.review.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
        gameId,
      },
    });
  }

  return (
    <ReviewFormForGame
      gameId={gameId}
      isSignedIn={!!session}
      existingReview={
        userReview
          ? {
              id: userReview.id,
              text: userReview.text,
              rating: userReview.rating,
            }
          : undefined
      }
    />
  );
}
