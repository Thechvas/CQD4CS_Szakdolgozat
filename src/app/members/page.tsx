import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function TopMembersPage() {
  const topMembers = await prisma.user.findMany({
    take: 10,
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      username: true,
      profilePic: true,
      followers: true,
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Top Members</h1>
      <div className="space-y-4">
        {topMembers.map((user, index) => (
          <Link
            key={user.id}
            href={`/user/${user.username}`}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow hover:shadow-md transition"
          >
            <div className="text-2xl font-bold w-8 text-center">
              {index + 1}.
            </div>
            <div className="w-16 h-16 relative">
              <Image
                src={user.profilePic || "/default-avatar.png"}
                alt={user.username}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <div className="text-lg font-semibold">{user.username}</div>
              <div className="text-sm text-gray-500">
                {user.followers.length} follower
                {user.followers.length !== 1 ? "s" : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
