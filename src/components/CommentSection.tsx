"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export function CommentSection({
  listId,
  initialComments,
}: {
  listId: string;
  initialComments: any[];
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");

  const postComment = async () => {
    if (!text.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      body: JSON.stringify({ text, listId }),
      headers: { "Content-Type": "application/json" },
    });
    const newComment = await res.json();
    setComments([newComment, ...comments]);
    setText("");
  };

  const deleteComment = async (id: string) => {
    await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    setComments(comments.filter((c) => c.id !== id));
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
            <div className="flex items-center gap-3 mb-2">
              <Image
                src={comment.user.profilePic || "/default_profile.jpg"}
                alt="User"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{comment.user.username}</p>
                <p className="text-xs text-gray-500">
                  Posted on {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="text-gray-800">{comment.text}</p>
            {session?.user.username === comment.user.username && (
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-red-500 text-sm mt-1 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
