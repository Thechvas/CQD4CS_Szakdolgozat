import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { username } = await params;

  const formData = await req.formData();
  const country = formData.get("country") as string | null;
  const profilePicUrl = formData.get("profilePicUrl") as string | null;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.id !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
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
