import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { uploadProfilePicture } from "@/lib/upload";

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect("/api/auth/signin");

  const formData = await req.formData();
  const country = formData.get("country") as string;
  const profilePicFile = formData.get("profilePic") as File | null;

  let profilePicUrl: string | undefined;

  if (profilePicFile) {
    profilePicUrl = await uploadProfilePicture(profilePicFile, session.user.id);
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      country,
      ...(profilePicUrl && { profilePic: profilePicUrl }),
    },
  });

  return NextResponse.json({ success: true });
}
