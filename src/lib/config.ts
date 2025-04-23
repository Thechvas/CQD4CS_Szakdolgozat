const clientId = process.env.IGDB_CLIENT_ID;
const clientSecret = process.env.IGDB_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET in environment variables");
}

export const IGDB_CLIENT_ID: string = clientId;
export const IGDB_CLIENT_SECRET: string = clientSecret;
