import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import FollowButton from "@/components/FollowButton";
import UserCountry from "@/components/UserCountry";
import ImageWrapper from "@/components/ImageWrapper";
import { Pen } from "lucide-react";
import UserReviews from "@/components/UserReviews";
import UserLists from "@/components/UserLists";
import Link from "next/link";
import { PageProps } from "@/types";

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;

  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      reviews: {
        orderBy: {
          createdAt: "desc",
        },
      },
      lists: true,
      followers: true,
      following: true,
    },
  });

  if (!user) return notFound();

  const isFollowing = user.followers.some(
    (follower) => follower.followerId === session?.user?.id
  );

  const isOwner = session?.user?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-md shadow-sm">
        <div className="flex items-center gap-4">
          <ImageWrapper
            src={user.profilePic || "/default_profile.jpg"}
            alt="Profile picture"
            width={64}
            height={64}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.username}</h1>

              {session?.user?.id && session.user.id !== user.id && (
                <FollowButton
                  userId={user.id}
                  isFollowingInitial={isFollowing}
                />
              )}
            </div>

            {user.country ? (
              <p className="text-sm text-gray-600 mt-1">
                <UserCountry countryCode={user.country} />
              </p>
            ) : (
              <p className="text-sm text-gray-600 mt-1">No country set</p>
            )}

            <p className="text-sm text-gray-500 mt-1">
              Member since:{" "}
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "numeric",
                day: "numeric",
              })}
            </p>

            <p className="text-sm text-gray-500 mt-1 space-x-2">
              <Link
                href={`/user/${user.username}/followers`}
                className="text-blue-600 hover:underline"
              >
                Followers: {user.followers.length}
              </Link>
              <span>•</span>
              <Link
                href={`/user/${user.username}/following`}
                className="text-blue-600 hover:underline"
              >
                Following: {user.following.length}
              </Link>
            </p>
          </div>
        </div>

        {isOwner && (
          <Link
            href={`/user/${user.username}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
          >
            <Pen className="w-4 h-4" />
            Edit
          </Link>
        )}
      </div>

      <UserLists username={username} isOwner={isOwner} userId={user.id} />

      <UserReviews username={username} />
    </div>
  );
}
