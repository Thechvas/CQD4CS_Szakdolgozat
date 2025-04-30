"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Pen, Trash2 } from "lucide-react";

export function ListActions({ listId }: { listId: string }) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this list?");
    if (!confirmed) return;

    const res = await fetch("/api/list", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId }),
    });

    if (res.ok) {
      toast.success("List deleted successfully");
      router.push(`/user/${session?.user?.username}`);
    } else {
      const data = await res.json();
      toast.error(`Failed to delete list: ${data.error}`);
    }
  };

  return (
    <>
      <a
        href={`/list/${listId}/edit`}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium transition"
      >
        <Pen className="w-4 h-4" />
        Edit
      </a>
      <button
        onClick={handleDelete}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-red-100 hover:bg-red-200 text-red-700 font-medium transition"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </>
  );
}
