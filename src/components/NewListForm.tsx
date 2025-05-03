"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface NewListFormProps {
  userId: string;
  onListCreated?: () => void;
}

const MAX_NAME_LENGTH = 50;
const MAX_DESC_LENGTH = 200;

export default function NewListForm({
  userId,
  onListCreated,
}: NewListFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("List name is required");
      return;
    }

    if (name.length > MAX_NAME_LENGTH || description.length > MAX_DESC_LENGTH) {
      toast.error("Character limit exceeded");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/list", {
        method: "POST",
        body: JSON.stringify({ name, description, userId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to create list");

      setName("");
      setDescription("");
      router.refresh();
      onListCreated?.();
    } catch (error) {
      toast.error("Error creating list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-3 text-sm">
      <div className="relative">
        <input
          type="text"
          placeholder="List name"
          className="w-full border rounded-md p-2 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME_LENGTH + 1}
          required
        />
        <span
          className={`absolute bottom-1 right-2 text-xs ${
            name.length > MAX_NAME_LENGTH ? "text-red-500" : "text-gray-400"
          }`}
        >
          {name.length}/{MAX_NAME_LENGTH}
        </span>
      </div>

      <div className="relative">
        <textarea
          placeholder="Description (optional)"
          className="w-full border rounded-md p-2 pr-12 pb-6 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={MAX_DESC_LENGTH + 1}
          rows={3}
        />
        <span
          className={`absolute bottom-2 right-2 text-xs ${
            description.length > MAX_DESC_LENGTH
              ? "text-red-500"
              : "text-gray-400"
          }`}
        >
          {description.length}/{MAX_DESC_LENGTH}
        </span>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded-md transition duration-200 disabled:opacity-50 text-sm"
        disabled={
          loading ||
          name.length > MAX_NAME_LENGTH ||
          description.length > MAX_DESC_LENGTH
        }
      >
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
