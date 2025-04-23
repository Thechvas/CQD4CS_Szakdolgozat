export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  first_release_date?: number;
  cover?: {
    image_id: string;
  };
  genres?: { name: string }[];
  themes?: { name: string }[];
  platforms?: { name: string }[];
  game_modes?: { name: string }[];
  involved_companies?: {
    company?: {
      name: string;
    };
  }[];
}
