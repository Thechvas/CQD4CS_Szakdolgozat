import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ reviewId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { reviewId } = await context.params;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) return new Response("Not Found", { status: 404 });
  if (review.userId !== session.user.id)
    return new Response("Forbidden", { status: 403 });

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return new Response("Deleted");
}
