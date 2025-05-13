import { POST } from "./route";
import { fetchFromIGDB } from "@/lib/igdb";

jest.mock("@/lib/igdb", () => ({
  fetchFromIGDB: jest.fn(),
}));

const createMockRequest = (body: object): Request =>
  ({ json: async () => body } as unknown as Request);

const mockGames = [
  { id: 1, name: "The Witcher", cover: { image_id: "abc" } },
  { id: 2, name: "The Witcher 2", cover: { image_id: "def" } },
  { id: 3, name: "Cyberpunk 2077", cover: { image_id: "xyz" } },
];

describe("POST /api/search", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns sorted exact and partial matches", async () => {
    (fetchFromIGDB as jest.Mock).mockResolvedValueOnce(mockGames);

    const req = createMockRequest({ query: "the witcher" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.length).toBeLessThanOrEqual(20);
    expect(data[0].name).toBe("The Witcher");
  });

  it("falls back to partial query if no good match", async () => {
    (fetchFromIGDB as jest.Mock)
      .mockResolvedValueOnce([
        { id: 5, name: "Unrelated Game", cover: { image_id: "x" } },
      ])
      .mockResolvedValueOnce(mockGames);

    const req = createMockRequest({ query: "cyberpunk 2077" });
    const res = await POST(req);
    const data = await res.json();

    expect(fetchFromIGDB).toHaveBeenCalledTimes(2);
    expect(data[0].name.toLowerCase()).toContain("cyberpunk");
  });

  it("returns 500 if IGDB fetch throws error", async () => {
    (fetchFromIGDB as jest.Mock).mockRejectedValue(new Error("Network error"));

    const req = createMockRequest({ query: "halo" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to fetch from IGDB");
  });

  it("trims and normalizes query", async () => {
    (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([
      { id: 1, name: "Halo Infinite", cover: { image_id: "123" } },
    ]);

    const req = createMockRequest({ query: "   HALO infinite " });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data[0].name).toBe("Halo Infinite");
  });
});
