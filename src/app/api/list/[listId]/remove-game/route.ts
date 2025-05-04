import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ listId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listId } = await context.params;
  const { gameId } = await req.json();

  if (typeof gameId !== "number") {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  const list = await prisma.list.findUnique({
    where: { id: listId },
    select: { userId: true, gameIds: true },
  });

  if (!list || list.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updatedGameIds = list.gameIds.filter((id) => id !== gameId);

  await prisma.list.update({
    where: { id: listId },
    data: { gameIds: updatedGameIds },
  });

  return NextResponse.json({ success: true });
}
