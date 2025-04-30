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

export default function EditListForm({ list }: EditListFormProps) {
  const [name, setName] = useState(list.name);
  const [description, setDescription] = useState(list.description || "");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch(`/api/list/${list.id}`, {
      method: "PUT",
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      toast.error("Failed to update list");
      return;
    }

    toast.success("List updated successfully");
    router.push(`/list/${list.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="w-full border rounded px-3 py-2 mt-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  );
}
