import { IGDBGame } from "@/types";
import { format } from "date-fns";

export default function GameDetails({ game }: { game: IGDBGame }) {
  const releaseDate = game.first_release_date
    ? format(new Date(game.first_release_date * 1000), "MMMM d, yyyy")
    : "Unknown";

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {game.cover && (
          <img
            src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
            alt={game.name}
            className="w-64 h-auto rounded-lg shadow-md object-cover"
          />
        )}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-2">{game.name}</h1>
          <p className="text-gray-600 mb-2">
            <strong>Release Date:</strong> {releaseDate}
          </p>

          {(game.involved_companies ?? []).length > 0 && (
            <p className="text-gray-600 mb-2">
              <strong>Company:</strong>{" "}
              {(game.involved_companies ?? [])
                .filter((c) => c.company?.name)
                .map((c) => c.company!.name)
                .join(", ")}
            </p>
          )}

          {game.genres && (
            <p className="text-gray-600 mb-2">
              <strong>Genres:</strong>{" "}
              {game.genres.map((g) => g.name).join(", ")}
            </p>
          )}

          {game.themes && (
            <p className="text-gray-600 mb-2">
              <strong>Themes:</strong>{" "}
              {game.themes.map((t) => t.name).join(", ")}
            </p>
          )}

          {game.platforms && (
            <p className="text-gray-600 mb-2">
              <strong>Platforms:</strong>{" "}
              {game.platforms.map((p) => p.name).join(", ")}
            </p>
          )}

          {game.game_modes && (
            <p className="text-gray-600 mb-2">
              <strong>Game Modes:</strong>{" "}
              {game.game_modes.map((m) => m.name).join(", ")}
            </p>
          )}
        </div>
      </div>

      {game.summary && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-2">Game Details</h2>
          <p className="text-gray-700">{game.summary}</p>
        </div>
      )}
    </div>
  );
}
