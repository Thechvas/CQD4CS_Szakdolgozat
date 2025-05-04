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

export type SegmentParams<T extends object = any> = T extends Record<
  string,
  any
>
  ? { [K in keyof T]: string | string[] | undefined }
  : T;

export interface PageProps {
  params: SegmentParams;
  searchParams?: any;
}
