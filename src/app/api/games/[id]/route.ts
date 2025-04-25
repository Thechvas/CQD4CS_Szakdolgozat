import { fetchFromIGDB } from "@/lib/igdb";
import { NextRequest } from "next/server";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return new Response(JSON.stringify({ error: "Invalid game ID" }), { status: 400 });
  }

  const [game] = await fetchFromIGDB("games", `
    fields name, cover.image_id;
    where id = ${id};
    limit 1;
  `);

  if (!game) {
    return new Response(JSON.stringify({ error: "Game not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({
    name: game.name,
    coverUrl: game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : "/default_game_cover.jpg",
  }));
}
