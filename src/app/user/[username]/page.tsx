import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import FollowButton from "@/components/FollowButton";
import ReviewCard from "@/components/ReviewCard";
import ListCard from "@/components/ListCard";
import UserCountry from "@/components/UserCountry";
import ImageWrapper from "@/components/ImageWrapper";
import NewListForm from "@/components/NewListForm";
import { revalidatePath } from "next/cache";
import { Pen } from "lucide-react";

interface UserProfilePageParams {
  params: {
    username: string;
  };
}

export default async function UserProfilePage({
  params,
}: UserProfilePageParams) {
  const { username } = await params;

  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      reviews: true,
      lists: true,
      followers: true,
      following: true,
    },
  });

  if (!user) return notFound();

  const isFollowing = user.followers.some(
    (follower) => follower.followerId === session?.user?.id
  );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-6">
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
              Followers: {user.followers.length} • Following:{" "}
              {user.following.length}
            </p>
          </div>
        </div>

        {session?.user?.id === user.id && (
          <a
            href={`/user/${user.username}/edit`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
          >
            <Pen className="w-4 h-4" />
            Edit
          </a>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Lists</h2>
        {session?.user?.id === user.id && (
          <NewListForm
            userId={user.id}
            onListCreated={async () => {
              "use server";
              revalidatePath(`/user/${username}`);
            }}
          />
        )}
        {user.lists.length > 0 ? (
          <ul className="space-y-4">
            {user.lists.map((list) => (
              <li key={list.id}>
                <ListCard
                  list={{
                    ...list,
                    createdAt: list.createdAt.toISOString(),
                    description: list.description || "No description available",
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No lists yet.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Reviews</h2>
        {user.reviews.length > 0 ? (
          <ul className="space-y-2">
            {user.reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
