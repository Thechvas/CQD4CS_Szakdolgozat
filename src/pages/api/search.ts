import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { query } = req.body;

  async function fetchSearchQuery(query: string) {
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID!,
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN!}`,
        Accept: "application/json",
      },
      body: `
        search "${query}";
        fields id, name, cover.image_id;
        limit 100;
      `,
    });
    return response.json();
  }

  async function fetchPartialQuery(query: string) {
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID!,
        Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN!}`,
        Accept: "application/json",
      },
      body: `
        fields id, name, cover.image_id;
        where name ~ *"${query}"*;
        sort popularity desc;
        limit 100;
      `,
    });
    return response.json();
  }

  try {
    const normalizedQuery = query.trim().toLowerCase();

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

    res.status(200).json(sortedData.slice(0, 20));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch from IGDB" });
  }
}
