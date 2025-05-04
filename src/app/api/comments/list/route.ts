import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const listId = searchParams.get("listId");
  if (!listId)
    return NextResponse.json({ error: "Missing listId" }, { status: 400 });

  const comments = await prisma.comment.findMany({
    where: { listId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, profilePic: true } },
    },
  });

  return NextResponse.json(comments);
}
