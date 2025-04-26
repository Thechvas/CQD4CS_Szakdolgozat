import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { query } = req.body;

  try {
    const igdbRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID!,
        "Authorization": `Bearer ${process.env.IGDB_ACCESS_TOKEN!}`,
        "Accept": "application/json",
      },
      body: `
        fields id, name, cover.image_id;
        where name ~ *"${query}"*;
        sort popularity desc;
        limit 10;
      `,
    });

    const data = await igdbRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch from IGDB" });
  }
}
