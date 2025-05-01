import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.toLowerCase() || "";

  if (!query) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: query,
        mode: "insensitive",
      },
    },
    take: 10,
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
