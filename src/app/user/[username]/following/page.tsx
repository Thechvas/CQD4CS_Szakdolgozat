import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import FollowButton from "@/components/FollowButton";

interface FollowingPageProps {
  params: {
    username: string;
  };
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      following: {
        include: {
          following: {
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

  if (!user || session?.user?.id !== user.id) return notFound();

  const followingUsers = user.following.map((entry) => entry.following);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Following ({followingUsers.length})
      </h1>

      {followingUsers.length > 0 ? (
        <ul className="space-y-4">
          {followingUsers.map((followedUser) => {
            const isFollowing = followedUser.followers.some(
              (f) => f.followerId === session.user?.id
            );

            return (
              <li
                key={followedUser.id}
                className="flex items-center gap-4 bg-white p-4 rounded-xl shadow"
              >
                <Link
                  href={`/user/${followedUser.username}`}
                  className="w-12 h-12 relative"
                >
                  <Image
                    src={followedUser.profilePic || "/default_profile.jpg"}
                    alt={followedUser.username}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </Link>

                <div className="flex-1">
                  <Link
                    href={`/user/${followedUser.username}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {followedUser.username}
                  </Link>
                  <div className="text-sm text-gray-500">
                    Followers: {followedUser.followers.length} • Following:{" "}
                    {followedUser.following.length} • Lists:{" "}
                    {followedUser.lists.length} • Reviews:{" "}
                    {followedUser.reviews.length}
                  </div>
                </div>

                <FollowButton
                  userId={followedUser.id}
                  isFollowingInitial={isFollowing}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500">You’re not following anyone yet.</p>
      )}
    </div>
  );
}
