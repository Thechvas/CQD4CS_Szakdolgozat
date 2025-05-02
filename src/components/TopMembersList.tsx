"use client";

import { useEffect, useState, useCallback } from "react";
import UserCard from "@/components/UserCard";

export default function TopMembersList() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/top-members", { cache: "no-store" });
    const data = await res.json();
    setMembers(data.users);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="space-y-4">
      {loading && <p>Loading...</p>}
      {members.map((user, index) => (
        <UserCard
          key={user.id}
          user={user}
          rank={index + 1}
          showFollowButton={true}
          refetchMembers={fetchMembers}
        />
      ))}
    </div>
  );
}
