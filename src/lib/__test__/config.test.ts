describe("config.ts", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should export IGDB_CLIENT_ID and IGDB_CLIENT_SECRET when set", async () => {
    process.env.IGDB_CLIENT_ID = "test-id";
    process.env.IGDB_CLIENT_SECRET = "test-secret";

    const config = await import("../config");
    expect(config.IGDB_CLIENT_ID).toBe("test-id");
    expect(config.IGDB_CLIENT_SECRET).toBe("test-secret");
  });

  it("should throw error if env variables are missing", () => {
    delete process.env.IGDB_CLIENT_ID;
    delete process.env.IGDB_CLIENT_SECRET;

    expect(() => {
      require("../config");
    }).toThrow(
      "Missing IGDB_CLIENT_ID or IGDB_CLIENT_SECRET in environment variables"
    );
  });
});
