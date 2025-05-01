import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    take: 10,
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    include: {
      followers: {
        select: { followerId: true },
      },
      following: true,
      lists: true,
      reviews: true,
    },
  });

  return NextResponse.json({ users });
}
