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
    if (reviewId) {
      await prisma.review.update({
        where: { id: reviewId },
        data: { text, rating },
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

      await prisma.review.create({
        data: {
          text,
          rating,
          gameId,
          user: {
            connect: { email: session.user.email! },
          },
        },
      });
    }

    return new Response("OK");
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return new Response("Duplicate review not allowed", { status: 409 });
    }

    console.error("Unexpected error:", err);
    return new Response("Server error", { status: 500 });
  }
}
