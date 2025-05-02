import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";

interface FollowersPageProps {
  params: {
    username: string;
  };
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      followers: {
        include: {
          follower: {
            include: {
              followers: true,
              following: true,
              lists: true,
              reviews: true,
            },
          },
        },
      },
    },
  });

  if (!user) return notFound();

  const followerUsers = user.followers.map((entry) => entry.follower);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Followers of {user.username} ({followerUsers.length})
      </h1>

      {followerUsers.length > 0 ? (
        <ul className="space-y-4">
          {followerUsers.map((followerUser) => {
            const isFollowing = session
              ? followerUser.followers.some(
                  (f) => f.followerId === session.user?.id
                )
              : false;

            return (
              <li
                key={followerUser.id}
                className="flex items-center gap-4 bg-white p-4 rounded-xl shadow"
              >
                <Link
                  href={`/user/${followerUser.username}`}
                  className="w-12 h-12 relative"
                >
                  <Image
                    src={followerUser.profilePic || "/default_profile.jpg"}
                    alt={followerUser.username}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </Link>

                <div className="flex-1">
                  <Link
                    href={`/user/${followerUser.username}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {followerUser.username}
                  </Link>
                  <div className="text-sm text-gray-500">
                    Followers: {followerUser.followers.length} • Following:{" "}
                    {followerUser.following.length} • Lists:{" "}
                    {followerUser.lists.length} • Reviews:{" "}
                    {followerUser.reviews.length}
                  </div>
                </div>

                {session?.user?.id && session.user.id !== followerUser.id && (
                  <FollowButton
                    userId={followerUser.id}
                    isFollowingInitial={isFollowing}
                  />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500">{user.username} has no followers yet.</p>
      )}
    </div>
  );
}
