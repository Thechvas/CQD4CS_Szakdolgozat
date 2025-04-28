import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

  if (reviewId) {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        text,
        rating,
      },
    });
  } else {
    await prisma.review.create({
      data: {
        text,
        rating,
        gameId,
        user: {
          connect: {
            email: session.user.email!,
          },
        },
      },
    });
  }

  return new Response("OK");
}
