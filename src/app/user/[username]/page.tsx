import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

interface Props {
  params: { username: string };
}

export default async function UserProfilePage({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      reviews: true,
      lists: true,
      followers: true,
      following: true,
    },
  });

  if (!user) return notFound();

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center gap-4 mb-6">
        <Image
          src={user.profilePic || "/default_profile.jpg"}
          alt="Profile picture"
          width={64}
          height={64}
          className="rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-sm text-gray-600">
            {user.country || "No country set"}
          </p>
          <p className="text-sm text-gray-500">
            Followers: {user.followers.length} • Following:{" "}
            {user.following.length}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Lists</h2>
        {user.lists.length > 0 ? (
          <ul className="space-y-2">
            {user.lists.map((list) => (
              <li key={list.id} className="border p-3 rounded bg-gray-50">
                <h3 className="font-semibold">{list.name}</h3>
                <p className="text-sm text-gray-600">{list.description}</p>
                <p className="text-xs text-gray-500">
                  Games: {list.gameIds.length}
                </p>
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
              <li key={review.id} className="border p-3 rounded bg-gray-50">
                <p className="text-sm">{review.text}</p>
                <p className="text-xs text-gray-500">
                  Rating: {review.rating}/10 • Game ID: {review.gameId}
                </p>
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
