"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

interface FollowButtonProps {
  userId: string;
  isFollowingInitial?: boolean;
}

export default function FollowButton({
  userId,
  isFollowingInitial = false,
}: FollowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);

  const handleFollowToggle = async () => {
    setIsLoading(true);

    try {
      const res = await toggleFollow(userId);

      if (res?.success) {
        setIsFollowing((prev) => !prev);
        toast.success(
          isFollowing ? "Unfollowed successfully" : "Followed successfully"
        );
      } else {
        toast.error(res?.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to toggle follow");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant={isFollowing ? "outline" : "secondary"}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className="h-8 px-3 text-xs"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isFollowing ? (
        "Unfollow"
      ) : (
        "Follow"
      )}
    </Button>
  );
}
