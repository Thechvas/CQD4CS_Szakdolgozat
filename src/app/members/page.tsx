import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

export default async function TopMembersPage() {
  const session = await getServerSession(authOptions);

  const topMembers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    include: {
      followers: true,
      following: true,
      lists: true,
      reviews: true,
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Top Members</h1>
      <div className="space-y-4">
        {topMembers.map((user, index) => {
          const isFollowing = user.followers.some(
            (follower) => follower.followerId === session?.user?.id
          );

          return (
            <div
              key={user.id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow hover:shadow-md transition"
            >
              <div className="text-2xl font-bold w-8 text-center">
                {index + 1}.
              </div>

              <Link
                href={`/user/${user.username}`}
                className="w-16 h-16 relative"
              >
                <Image
                  src={user.profilePic || "/default-avatar.png"}
                  alt={user.username}
                  fill
                  className="rounded-full object-cover"
                  sizes="64px"
                />
              </Link>

              <div className="flex-1">
                <Link
                  href={`/user/${user.username}`}
                  className="text-lg font-semibold hover:underline"
                >
                  {user.username}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  Followers: {user.followers.length} • Following:{" "}
                  {user.following.length} • Lists: {user.lists.length} •
                  Reviews: {user.reviews.length}
                </div>
              </div>

              {session?.user?.id && session.user.id !== user.id && (
                <FollowButton
                  userId={user.id}
                  isFollowingInitial={isFollowing}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
