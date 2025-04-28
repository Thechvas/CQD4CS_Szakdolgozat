"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { X } from "lucide-react";
import ImageWrapper from "./ImageWrapper";

export default function GameSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  let currentRequestId = 0;

  useEffect(() => {
    if (query.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      const requestId = ++currentRequestId;
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const data = await res.json();

        if (requestId !== currentRequestId) {
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Invalid data from search:", data);
          setResults([]);
          setLoading(false);
          return;
        }

        const normalizedQuery = query.trim().toLowerCase();
        const exactMatches = data.filter(
          (game: any) => game.name.trim().toLowerCase() === normalizedQuery
        );
        const startsWithMatches = data.filter(
          (game: any) =>
            game.name.trim().toLowerCase().startsWith(normalizedQuery) &&
            game.name.trim().toLowerCase() !== normalizedQuery
        );
        const otherMatches = data.filter(
          (game: any) =>
            !game.name.trim().toLowerCase().startsWith(normalizedQuery)
        );

        setResults([...exactMatches, ...startsWithMatches, ...otherMatches]);
        setShowResults(true);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
      setLoading(false);
    };

    const debouncedFetch = debounce(fetchGames, 300);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [query]);

  const handleClick = (gameId: number) => {
    router.push(`/game/${gameId}`);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && results.length > 0) {
      handleClick(results[0].id);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a game..."
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute left-0 mt-2 w-full bg-gray-900 p-2 rounded-md shadow-lg max-h-[400px] overflow-y-auto z-50">
          {loading ? (
            <div className="text-center text-white p-4">Loading...</div>
          ) : results.length > 0 ? (
            results.slice(0, 10).map((game) => (
              <div
                key={game.id}
                onClick={() => handleClick(game.id)}
                className="flex items-center p-2 hover:bg-gray-800 rounded-md cursor-pointer"
              >
                {game.cover ? (
                  <div className="mr-4">
                    <ImageWrapper
                      src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover.image_id}.jpg`}
                      alt={game.name}
                      width={50}
                      height={70}
                    />
                  </div>
                ) : (
                  <div className="w-[50px] h-[70px] bg-gray-700 flex items-center justify-center rounded-md text-xs text-gray-400 mr-4">
                    No Image
                  </div>
                )}

                <span className="text-white font-medium truncate">
                  {game.name}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 p-4">No games found.</div>
          )}
        </div>
      )}
    </div>
  );
}
