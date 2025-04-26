import { fetchFromIGDB } from "@/lib/igdb";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return new Response(JSON.stringify({ error: "Missing ids parameter" }), { status: 400 });
  }

  const ids = idsParam.split(",").map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));

  if (ids.length === 0) {
    return new Response(JSON.stringify({ error: "No valid IDs provided" }), { status: 400 });
  }

  const games = await fetchFromIGDB("games", `
    fields id, name, cover.image_id;
    where id = (${ids.join(",")});
    limit ${ids.length};
  `);

  return new Response(JSON.stringify(
    games.map((game: any) => ({
      id: game.id,
      name: game.name,
      coverUrl: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : "/default_game_cover.jpg",
    }))
  ));
}
