import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { listId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description } = await req.json();

  const list = await prisma.list.findUnique({
    where: { id: params.listId },
  });

  if (!list || list.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.list.update({
    where: { id: params.listId },
    data: { name, description },
  });

  return NextResponse.json(updated);
}
