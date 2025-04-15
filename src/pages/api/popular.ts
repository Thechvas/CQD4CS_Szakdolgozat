// pages/api/popular-steam.ts

import type { NextApiRequest, NextApiResponse } from 'next';

let accessToken: string | null = null;
let tokenExpiry = 0;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const now = Date.now() / 1000;

    if (!accessToken || now >= tokenExpiry) {
      const tokenRes = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.TWITCH_CLIENT_ID!,
          client_secret: process.env.TWITCH_CLIENT_SECRET!,
          grant_type: 'client_credentials',
        }),
      });

      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
      tokenExpiry = now + tokenData.expires_in;
    }

    // Step 1: Get top Steam games by 24hr Peak Players
    const primitiveRes = await fetch('https://api.igdb.com/v4/popularity_primitives', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `
  fields game_id, value;
  sort value desc;
  where popularity_type = 9;
  limit 10;
`,
    });

    const primitives = await primitiveRes.json();
    const gameIds = primitives.map((entry: any) => entry.game_id).join(',');

    // Step 2: Get game details
    const gamesRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `
        fields name, cover.url, summary, first_release_date;
        where id = (${gameIds});
      `,
    });

    const gamesData = await gamesRes.json();
    res.status(200).json(gamesData);
  } catch (error) {
    console.error('Steam Popularity Error:', error);
    res.status(500).json({ error: 'Failed to load top Steam games' });
  }
}
