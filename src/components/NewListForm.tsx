"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface NewListFormProps {
  userId: string;
  onListCreated: () => void;
}

export default function NewListForm({
  userId,
  onListCreated,
}: NewListFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("List name is required");
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
      toast.success("List created");
      onListCreated();
    } catch (error) {
      toast.error("Error creating list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-2">
      <input
        type="text"
        placeholder="List name"
        className="w-full border rounded p-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description (optional)"
        className="w-full border rounded p-2"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Add List"}
      </button>
    </form>
  );
}
