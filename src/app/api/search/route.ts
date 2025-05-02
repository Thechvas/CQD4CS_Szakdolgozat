import { NextResponse } from "next/server";
import { fetchFromIGDB } from "@/lib/igdb";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const normalizedQuery = query.trim().toLowerCase();

    async function fetchSearchQuery(query: string) {
      return fetchFromIGDB(
        "games",
        `
        search "${query}";
        fields id, name, cover.image_id;
        limit 100;
      `
      );
    }

    async function fetchPartialQuery(query: string) {
      return fetchFromIGDB(
        "games",
        `
        fields id, name, cover.image_id;
        where name ~ *"${query}"*;
        sort popularity desc;
        limit 100;
      `
      );
    }

    let games = await fetchSearchQuery(query);

    const hasGoodMatch = games.some((game: any) => {
      const name = game.name.trim().toLowerCase();
      return name === normalizedQuery || name.startsWith(normalizedQuery);
    });

    if (!hasGoodMatch) {
      games = await fetchPartialQuery(query);
    }

    const exactMatches = games.filter(
      (game: any) => game.name.trim().toLowerCase() === normalizedQuery
    );

    const startsWithMatches = games.filter(
      (game: any) =>
        game.name.trim().toLowerCase().startsWith(normalizedQuery) &&
        game.name.trim().toLowerCase() !== normalizedQuery
    );

    const otherMatches = games.filter(
      (game: any) => !game.name.trim().toLowerCase().startsWith(normalizedQuery)
    );

    const sortedData = [...exactMatches, ...startsWithMatches, ...otherMatches];

    return NextResponse.json(sortedData.slice(0, 20));
  } catch (error) {
    console.error("IGDB Search Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from IGDB" },
      { status: 500 }
    );
  }
}
