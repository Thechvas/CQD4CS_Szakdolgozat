import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lists = await prisma.list.findMany({
    where: {
      user: { email: session.user.email },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(lists);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Missing list name" }, { status: 400 });
    }

    const newList = await prisma.list.create({
      data: {
        name,
        description,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newList, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = await req.json();
    if (!listId) {
      return NextResponse.json({ error: "Missing listId" }, { status: 400 });
    }

    const list = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (!list || list.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.list.delete({
      where: { id: listId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
