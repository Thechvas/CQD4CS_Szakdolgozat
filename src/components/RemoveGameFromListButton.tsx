"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function RemoveGameFromListButton({
  listId,
  gameId,
}: {
  listId: string;
  gameId: number;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);

    const deletePromise = fetch(`/api/list/${listId}/remove-game`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });

    toast.promise(deletePromise, {
      loading: "Removing game...",
      success: "Game removed",
      error: "Failed to remove game",
    });

    try {
      const res = await deletePromise;
      if (res.ok) router.refresh();
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="absolute bottom-0 right-0">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
        title="Remove from list"
      >
        <Trash2 size={16} className="pointer-events-none" />
      </button>
    </div>
  );
}
