import { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } from "./config";

let accessToken: string;
let tokenExpiry: number | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now() / 1000;

  if (accessToken && tokenExpiry && now < tokenExpiry) {
    return accessToken;
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: IGDB_CLIENT_ID,
      client_secret: IGDB_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch access token");

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = now + data.expires_in;

  return accessToken;
}

export async function fetchFromIGDB(endpoint: string, query: string) {
  const token = await getAccessToken();

  const res = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: query,
  });

  if (!res.ok) throw new Error(`IGDB fetch failed with status ${res.status}`);
  return res.json();
}
