"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EditListFormProps {
  list: {
    id: string;
    name: string;
    description: string | null;
  };
}

const MAX_NAME_LENGTH = 50;
const MAX_DESC_LENGTH = 200;

export default function EditListForm({ list }: EditListFormProps) {
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || "");
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
      const res = await fetch(`/api/list/${list.id}`, {
        method: "PUT",
        body: JSON.stringify({ name, description }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update list");

      toast.success("List updated successfully");
      router.push(`/list/${list.id}`);
    } catch (error) {
      toast.error("Failed to update list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-4 rounded-md shadow-sm border"
    >
      <fieldset disabled={loading} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="List name"
            className="w-full border rounded-md p-2 pr-12 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
            className="w-full border rounded-md p-2 pr-12 pb-6 resize-none bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
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
          className="w-full bg-black hover:bg-black/90 text-white font-medium py-1.5 rounded-md transition duration-200 disabled:opacity-50 text-sm"
          disabled={
            name.length > MAX_NAME_LENGTH ||
            description.length > MAX_DESC_LENGTH
          }
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </fieldset>
    </form>
  );
}
