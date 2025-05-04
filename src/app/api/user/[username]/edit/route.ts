import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await context.params;

  const formData = await req.formData();
  const newUsername = formData.get("username") as string | null;
  const country = formData.get("country") as string | null;
  const profilePicUrl = formData.get("profilePicUrl") as string | null;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (newUsername && newUsername !== user.username) {
    const existing = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 409 }
      );
    }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        username: newUsername ?? user.username,
        country: country || null,
        profilePic: profilePicUrl || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
