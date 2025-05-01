"use client";

import { useState } from "react";
import UserCard from "./UserCard";
import { X } from "lucide-react";

export default function SearchUser() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalFound, setTotalFound] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    const res = await fetch(`/api/search-users?query=${query}`);
    const data = await res.json();

    const sorted = data.users.sort((a: any, b: any) =>
      a.username.localeCompare(b.username)
    );
    const topThree = sorted.slice(0, 3);

    setTotalFound(data.users.length);
    setResults(topThree);
    setLoading(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setTotalFound(0);
  };

  return (
    <div className="space-y-4 mb-10">
      <div className="bg-white rounded-2xl shadow px-6 py-4">
        <form
          onSubmit={handleSearch}
          className="relative flex gap-3 items-center"
        >
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for a user..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition"
          >
            Search
          </button>
        </form>
      </div>

      {loading && <p className="text-sm text-gray-600">Searching...</p>}

      {!loading && hasSearched && results.length === 0 && (
        <p className="text-sm text-gray-500 italic">No results.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((user) => (
            <UserCard key={user.id} user={user} showFollowButton={false} />
          ))}

          {totalFound > 3 && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Only top 3 results shown. Refine your search to find more users.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
