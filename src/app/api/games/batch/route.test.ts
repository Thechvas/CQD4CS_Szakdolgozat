import { GET } from "./route";
import { fetchFromIGDB } from "@/lib/igdb";
import { NextRequest } from "next/server";

jest.mock("@/lib/igdb", () => ({
  fetchFromIGDB: jest.fn(),
}));

const createMockRequest = (search: string): NextRequest => {
  const url = new URL(`http://localhost/api/games?${search}`);
  return {
    nextUrl: url,
    method: "GET",
  } as unknown as NextRequest;
};

describe("GET /api/games?ids=...", () => {
  it("returns 400 if 'ids' is missing", async () => {
    const req = createMockRequest("");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing ids parameter");
  });

  it("returns 400 if 'ids' has no valid integers", async () => {
    const req = createMockRequest("ids=abc,def");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("No valid IDs provided");
  });

  it("returns formatted game data for valid ids", async () => {
    (fetchFromIGDB as jest.Mock).mockResolvedValue([
      {
        id: 1,
        name: "Game One",
        cover: { image_id: "img123" },
      },
      {
        id: 2,
        name: "Game Two",
        cover: null,
      },
    ]);

    const req = createMockRequest("ids=1,2");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(fetchFromIGDB).toHaveBeenCalledWith(
      "games",
      expect.stringContaining("where id = (1,2);")
    );

    expect(data).toEqual([
      {
        id: 1,
        name: "Game One",
        coverUrl:
          "https://images.igdb.com/igdb/image/upload/t_cover_big/img123.jpg",
      },
      {
        id: 2,
        name: "Game Two",
        coverUrl: "/default_game_cover.jpg",
      },
    ]);
  });
});
