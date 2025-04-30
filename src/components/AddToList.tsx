"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface AddToListProps {
  gameId: number;
}

interface List {
  id: string;
  name: string;
}

export default function AddToList({ gameId }: AddToListProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");

  useEffect(() => {
    axios.get<List[]>("/api/list").then((res) => {
      setLists(res.data);
    });
  }, []);

  const handleAdd = async () => {
    if (!selectedList) return;

    try {
      await axios.post("/api/list/add-game", {
        listId: selectedList,
        gameId,
      });
      toast.success("Game added to list!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add game to list.");
    }
  };

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-2">Add to List</h2>
      <div className="flex items-center gap-4">
        <select
          className="border px-3 py-2 rounded-md"
          value={selectedList}
          onChange={(e) => setSelectedList(e.target.value)}
        >
          <option value="">Select a list</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}
