import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { gameId, text, rating, reviewId } = await req.json();

  if (!text || text.length > 8000) {
    return new Response("Review text is too long (max 8000 characters)", {
      status: 400,
    });
  }

  if (rating < 1 || rating > 10) {
    return new Response("Invalid rating", { status: 400 });
  }

  try {
    let review;

    if (reviewId) {
      review = await prisma.review.update({
        where: { id: reviewId },
        data: { text, rating },
        include: {
          user: { select: { username: true, profilePic: true } },
        },
      });
    } else {
      const existing = await prisma.review.findUnique({
        where: {
          userId_gameId: {
            userId: session.user.id,
            gameId,
          },
        },
      });

      if (existing) {
        return new Response("You already reviewed this game", { status: 409 });
      }

      review = await prisma.review.create({
        data: {
          text,
          rating,
          gameId,
          user: {
            connect: { email: session.user.email! },
          },
        },
        include: {
          user: { select: { username: true, profilePic: true } },
        },
      });
    }

    const fullReview = await prisma.review.findUnique({
      where: { id: review.id },
      include: {
        user: {
          select: {
            username: true,
            profilePic: true,
          },
        },
        _count: {
          select: { likes: true },
        },
        likes: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    return new Response(
      JSON.stringify({
        ...fullReview,
        likeCount: fullReview?._count.likes,
        likedByUser: fullReview ? fullReview.likes.length > 0 : false,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return new Response("Duplicate review not allowed", { status: 409 });
    }

    console.error("Unexpected error:", err);
    return new Response("Server error", { status: 500 });
  }
}
