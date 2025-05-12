import {
  getPopularSteamGames,
  getTopRatedGames,
  getMostPlayedGames,
  getRecentlyReleasedGames,
} from "../igdb-utils";

jest.mock("../igdb", () => ({
  fetchFromIGDB: jest.fn(),
}));

const { fetchFromIGDB } = require("../igdb");

describe("igdb-utils.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPopularSteamGames", () => {
    it("returns game details based on popular primitives", async () => {
      (fetchFromIGDB as jest.Mock)
        .mockResolvedValueOnce([{ game_id: 1 }, { game_id: 2 }, { game_id: 3 }])
        .mockResolvedValueOnce([
          { id: 1, name: "Game 1", cover: { image_id: "cover1" } },
          { id: 2, name: "Game 2", cover: { image_id: "cover2" } },
          { id: 3, name: "Game 3", cover: { image_id: "cover3" } },
        ]);

      const result = await getPopularSteamGames(3);
      expect(fetchFromIGDB).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe("Game 1");
    });

    it("returns empty array if no primitives", async () => {
      (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([]);
      const result = await getPopularSteamGames();
      expect(fetchFromIGDB).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("throws if chunk fetch fails", async () => {
      (fetchFromIGDB as jest.Mock)
        .mockResolvedValueOnce([{ game_id: 1 }, { game_id: 2 }])
        .mockImplementationOnce(() => {
          throw new Error("Chunk fetch failed");
        });

      await expect(getPopularSteamGames()).rejects.toThrow(
        "Chunk fetch failed"
      );
    });

    it("handles more than one chunk of game IDs", async () => {
      const mockGameIds = Array.from({ length: 25 }, (_, i) => ({
        game_id: i + 1,
      }));
      const mockGames = Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Game ${i + 1}`,
        cover: { image_id: `cover${i + 1}` },
      }));

      (fetchFromIGDB as jest.Mock)
        .mockResolvedValueOnce(mockGameIds)
        .mockResolvedValueOnce(mockGames.slice(0, 20))
        .mockResolvedValueOnce(mockGames.slice(20, 25));

      const result = await getPopularSteamGames(25);
      expect(result).toHaveLength(25);
      expect(result[0].name).toBe("Game 1");
      expect(result[24].name).toBe("Game 25");
    });

    it("returns less than the overfetch limit when slicing", async () => {
      const mockGameIds = Array.from({ length: 10 }, (_, i) => ({
        game_id: i + 1,
      }));
      const mockGames = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Game ${i + 1}`,
        cover: { image_id: `cover${i + 1}` },
      }));

      (fetchFromIGDB as jest.Mock)
        .mockResolvedValueOnce(mockGameIds)
        .mockResolvedValueOnce(mockGames);

      const result = await getPopularSteamGames(5);
      expect(result).toHaveLength(5);
      expect(result[4].name).toBe("Game 5");
    });
  });

  describe("getTopRatedGames", () => {
    it("fetches top rated games", async () => {
      (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([
        { name: "Top Game", cover: { image_id: "abc" } },
      ]);

      const result = await getTopRatedGames(1);
      expect(fetchFromIGDB).toHaveBeenCalledWith(
        "games",
        expect.stringContaining("sort rating desc")
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Top Game");
    });

    it("throws if fetchFromIGDB fails", async () => {
      (fetchFromIGDB as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Failed to fetch top rated games");
      });

      await expect(getTopRatedGames()).rejects.toThrow(
        "Failed to fetch top rated games"
      );
    });

    it("returns empty array if no top rated games", async () => {
      (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([]);
      const result = await getTopRatedGames(3);
      expect(result).toEqual([]);
    });
  });

  describe("getMostPlayedGames", () => {
    it("fetches most played games", async () => {
      (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([
        { name: "Played Game", cover: { image_id: "img" } },
      ]);

      const result = await getMostPlayedGames(1);
      expect(fetchFromIGDB).toHaveBeenCalledWith(
        "games",
        expect.stringContaining("sort total_rating_count desc")
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Played Game");
    });

    it("throws if fetchFromIGDB fails", async () => {
      (fetchFromIGDB as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Failed to fetch most played games");
      });

      await expect(getMostPlayedGames()).rejects.toThrow(
        "Failed to fetch most played games"
      );
    });

    it("returns empty array if no most played games", async () => {
      (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([]);
      const result = await getMostPlayedGames(3);
      expect(result).toEqual([]);
    });
  });

  describe("getRecentlyReleasedGames", () => {
    it("fetches recently released games", async () => {
      (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([
        {
          name: "Recent Game",
          cover: { image_id: "xyz" },
          first_release_date: 1700000000,
        },
      ]);

      const result = await getRecentlyReleasedGames(1);
      expect(fetchFromIGDB).toHaveBeenCalledWith(
        "games",
        expect.stringContaining("sort first_release_date desc")
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Recent Game");
    });

    it("throws if fetchFromIGDB fails", async () => {
      (fetchFromIGDB as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Failed to fetch recently released games");
      });

      await expect(getRecentlyReleasedGames()).rejects.toThrow(
        "Failed to fetch recently released games"
      );
    });

    it("returns empty array if no recently released games", async () => {
      (fetchFromIGDB as jest.Mock).mockResolvedValueOnce([]);
      const result = await getRecentlyReleasedGames(3);
      expect(result).toEqual([]);
    });
  });
});
