import { NextRequest } from "next/server";
import { GET } from "./route";
import { fetchFromIGDB } from "@/lib/igdb";

jest.mock("@/lib/igdb", () => ({
  fetchFromIGDB: jest.fn(),
}));

describe("GET /api/game/[id]", () => {
  const createContext = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  const req = {
    method: "GET",
    url: "http://localhost/api/game/123",
  } as unknown as NextRequest;

  it("returns 400 for invalid ID", async () => {
    const res = await GET(req, createContext("abc"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid game ID");
  });

  it("returns 404 if game not found", async () => {
    (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([]);

    const res = await GET(req, createContext("123"));
    const data = await res.json();

    expect(fetchFromIGDB).toHaveBeenCalledWith(
      "games",
      expect.stringContaining("where id = 123")
    );
    expect(res.status).toBe(404);
    expect(data.error).toBe("Game not found");
  });

  it("returns game data with cover", async () => {
    (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([
      {
        name: "Test Game",
        cover: { image_id: "abc123" },
      },
    ]);

    const res = await GET(req, createContext("123"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("Test Game");
    expect(data.coverUrl).toBe(
      "https://images.igdb.com/igdb/image/upload/t_cover_big/abc123.jpg"
    );
  });

  it("returns default cover if game has no cover", async () => {
    (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([
      {
        name: "Game Without Cover",
        cover: null,
      },
    ]);

    const res = await GET(req, createContext("456"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe("Game Without Cover");
    expect(data.coverUrl).toBe("/default_game_cover.jpg");
  });
});
