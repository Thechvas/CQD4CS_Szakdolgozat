"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListCard from "./ListCard";
import NewListForm from "./NewListForm";

interface List {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  gameIds: number[];
}

interface Props {
  username: string;
  isOwner: boolean;
  listsPerPage?: number;
  userId: string;
}

export default function UserLists({
  username,
  isOwner,
  listsPerPage = 3,
  userId,
}: Props) {
  const [lists, setLists] = useState<List[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(total / listsPerPage);
  const listSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchLists = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/list/by-user/${username}?page=${page}&perPage=${listsPerPage}`
      );
      const data = await res.json();
      setLists(data.lists);
      setTotal(data.total);
      setLoading(false);
    };

    fetchLists();
  }, [page, username, listsPerPage]);

  const changePage = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div ref={listSectionRef} className="mb-6">
      {isOwner && (
        <>
          <h2 className="text-xl font-semibold mb-2">Create a list</h2>
          <NewListForm
            userId={userId}
            onListCreated={() => window.location.reload()}
          />
        </>
      )}

      <h2 className="text-xl font-semibold mb-2">Lists ({total})</h2>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : lists.length > 0 ? (
        <>
          <ul className="space-y-4">
            {lists.map((list) => (
              <li key={list.id}>
                <ListCard
                  list={{
                    ...list,
                    description: list.description || "No description available",
                  }}
                />
              </li>
            ))}
          </ul>

          <div className="flex justify-center mt-4 items-center space-x-4">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-full border ${
                page === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm text-gray-700 font-medium">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className={`p-2 rounded-full border ${
                page === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-100"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No lists yet.</p>
      )}
    </div>
  );
}
