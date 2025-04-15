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

    const igdbRes = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `
        fields name, cover.url, rating, rating_count, first_release_date;
        where rating != null & rating_count > 5 & cover != null;
        sort rating_count desc;
        limit 10;
      `,
    });

    const data = await igdbRes.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
