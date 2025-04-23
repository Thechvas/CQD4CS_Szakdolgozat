import { fetchFromIGDB } from "./igdb";
import { IGDBGame } from "@/types";

export async function getPopularSteamGames(limit: number = 10): Promise<IGDBGame[]> {
    const primitives = await fetchFromIGDB("popularity_primitives", `
      fields game_id, value;
      sort value desc;
      where popularity_type = 9;
      limit ${limit};
    `);
  
    const gameIds = primitives.map((entry: any) => entry.game_id).join(",");
    if (!gameIds) return [];
  
    return fetchFromIGDB("games", `
      fields name, cover.image_id;
      where id = (${gameIds});
    `);
  }
  

export async function getTopRatedGames(limit = 5): Promise<IGDBGame[]> {
  return fetchFromIGDB("games", `
    fields name, cover.image_id;
    sort rating desc;
    where rating != null & cover != null & rating_count > 40;
    limit ${limit};
  `);
}

export async function getMostPlayedGames(limit = 5): Promise<IGDBGame[]> {
  return fetchFromIGDB("games", `
    fields name, cover.image_id;
    sort total_rating_count desc;
    where total_rating_count != null & cover != null;
    limit ${limit};
  `);
}

export async function getRecentlyReleasedGames(limit = 5): Promise<IGDBGame[]> {
    const today = Math.floor(Date.now() / 1000);
  
    return fetchFromIGDB("games", `
      fields name, cover.image_id, first_release_date;
      sort first_release_date desc;
      where first_release_date != null & first_release_date <= ${today} & cover != null;
      limit ${limit};
    `);
  }
  
