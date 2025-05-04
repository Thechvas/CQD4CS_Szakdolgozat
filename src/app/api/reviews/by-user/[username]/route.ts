import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { username } = await context.params;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("perPage") || "3", 10);

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const total = await prisma.review.count({
    where: { userId: user.id },
  });

  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      user: {
        select: {
          username: true,
          profilePic: true,
        },
      },
      likes: userId
        ? {
            where: { userId },
            select: { id: true },
          }
        : false,
      _count: {
        select: { likes: true },
      },
    },
  });

  const reviewsWithLikeInfo = reviews.map((review) => ({
    ...review,
    likeCount: review._count.likes,
    likedByUser: userId ? review.likes.length > 0 : false,
  }));

  return NextResponse.json({ reviews: reviewsWithLikeInfo, total });
}
