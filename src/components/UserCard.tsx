"use client";

import Link from "next/link";
import Image from "next/image";
import FollowButton from "@/components/FollowButton";
import { useSession } from "next-auth/react";

type UserCardProps = {
  user: {
    id: string;
    username: string;
    profilePic: string | null;
    followers: { followerId: string }[];
    following: any[];
    lists: any[];
    reviews: any[];
  };
  rank?: number;
  showFollowButton?: boolean;
  refetchMembers?: () => void;
};

export default function UserCard({
  user,
  rank,
  showFollowButton = true,
  refetchMembers,
}: UserCardProps) {
  const { data: session } = useSession();
  const isFollowing = user.followers.some(
    (f) => f.followerId === session?.user?.id
  );

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow hover:shadow-md transition">
      {rank !== undefined && (
        <div className="text-2xl font-bold w-8 text-center">{rank}.</div>
      )}

      <Link href={`/user/${user.username}`} className="w-16 h-16 relative">
        <Image
          src={user.profilePic || "/default_profile.jpg"}
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
          {user.following.length} • Lists: {user.lists.length} • Reviews:{" "}
          {user.reviews.length}
        </div>
      </div>

      {showFollowButton && session?.user?.id && session.user.id !== user.id && (
        <FollowButton
          userId={user.id}
          isFollowingInitial={isFollowing}
          onFollowToggle={refetchMembers}
        />
      )}
    </div>
  );
}
