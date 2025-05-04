"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";

export function CommentSection({ listId }: { listId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  const fetchComments = async () => {
    const res = await fetch(`/api/comments/list?listId=${listId}`);
    const data = await res.json();
    setComments(data);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const postComment = async () => {
    if (!text.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({ text, listId }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setText("");
      fetchComments(); // refresh comments after posting
    }
  };

  const deleteComment = async (id: string) => {
    await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    fetchComments();
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">
        Comments ({comments.length})
      </h2>

      {session && (
        <div className="mb-6">
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Leave your comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={postComment}
            className="mt-2 px-4 py-1 bg-black text-white rounded hover:bg-black/90"
          >
            Post
          </button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-4">
            <div className="flex justify-between items-start mb-2">
              <Link
                href={`/user/${comment.user.username}`}
                className="flex items-center gap-3 hover:underline"
              >
                <Image
                  src={comment.user.profilePic || "/default_profile.jpg"}
                  alt={comment.user.username}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
                <p className="font-medium">{comment.user.username}</p>
              </Link>

              {session?.user.username === comment.user.username && (
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              )}
            </div>

            <p className="text-gray-800 mb-2 break-words whitespace-pre-wrap">
              {comment.text}
            </p>

            <p className="text-xs text-gray-500">
              Posted on {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
