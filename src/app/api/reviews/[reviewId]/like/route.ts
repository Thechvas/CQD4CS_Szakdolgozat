import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ reviewId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { reviewId } = await context.params;
  const userId = session.user.id;

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_reviewId: {
        userId,
        reviewId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: {
        userId,
        reviewId,
      },
    });
  }

  const likeCount = await prisma.like.count({
    where: { reviewId },
  });

  return NextResponse.json({
    liked: !existingLike,
    likeCount,
  });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ reviewId: string }> }
) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const { reviewId } = await context.params;

  const likeCount = await prisma.like.count({
    where: { reviewId },
  });

  let likedByUser = false;

  if (userId) {
    const like = await prisma.like.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    likedByUser = !!like;
  }

  return NextResponse.json({
    likedByUser,
    likeCount,
  });
}
