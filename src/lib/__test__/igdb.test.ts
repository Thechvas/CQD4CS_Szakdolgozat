beforeAll(() => {
  process.env.IGDB_CLIENT_ID = "mock-client-id";
  process.env.IGDB_CLIENT_SECRET = "mock-client-secret";
});

describe("igdb.ts", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should fetch data from IGDB", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "mock-token", expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1 }],
      });

    const { fetchFromIGDB } = await import("../igdb");
    const data = await fetchFromIGDB("games", "fields name;");
    expect(data).toEqual([{ id: 1 }]);
  });

  it("should return cached token if valid", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "mock-token", expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1 }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1 }],
      });

    const { fetchFromIGDB } = await import("../igdb");
    await fetchFromIGDB("games", "fields name;");
    const second = await fetchFromIGDB("games", "fields name;");

    expect(second).toEqual([{ id: 1 }]);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it("should throw if access token fetch fails", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false });

    const { fetchFromIGDB } = await import("../igdb");
    await expect(fetchFromIGDB("games", "")).rejects.toThrow(
      "Failed to fetch access token"
    );
  });

  it("should throw if IGDB fetch fails", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "mock-token", expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

    const { fetchFromIGDB } = await import("../igdb");
    await expect(fetchFromIGDB("games", "")).rejects.toThrow(
      "Failed to fetch from IGDB"
    );
  });

  it("should throw if fetch throws unexpectedly", async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error("Network failure");
    });

    const { fetchFromIGDB } = await import("../igdb");

    await expect(fetchFromIGDB("games", "fields name;")).rejects.toThrow(
      "Network failure"
    );
  });
});
