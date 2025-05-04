import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listId, text } = await req.json();
  if (!text || !listId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      text,
      listId,
      userId: session.user.id,
    },
    include: {
      user: { select: { username: true, profilePic: true } },
    },
  });

  return NextResponse.json(comment);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get("id");
  if (!commentId)
    return NextResponse.json({ error: "Missing comment ID" }, { status: 400 });

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
