import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listId, gameId } = await req.json();

  if (!listId || typeof gameId !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const list = await prisma.list.findUnique({
      where: { id: listId },
      select: { gameIds: true },
    });

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    if (list.gameIds.includes(gameId)) {
      return NextResponse.json(
        { error: "Game already in list" },
        { status: 409 }
      );
    }

    await prisma.list.update({
      where: { id: listId },
      data: {
        gameIds: {
          push: gameId,
        },
      },
    });

    return NextResponse.json({ message: "Game added to list" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Database update failed" },
      { status: 500 }
    );
  }
}
