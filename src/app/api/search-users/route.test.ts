import { GET } from "./route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

const createMockRequest = (queryString: string): Request =>
  ({
    url: `http://localhost/api/search/users?${queryString}`,
  } as unknown as Request);

describe("GET /api/search/users", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns an empty array if query is missing", async () => {
    const req = createMockRequest("");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.users).toEqual([]);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it("returns matching users for a valid query", async () => {
    const mockUsers = [
      {
        id: "u1",
        username: "testuser",
        followers: [{ followerId: "u2" }],
        following: [],
        lists: [],
        reviews: [],
      },
      {
        id: "u2",
        username: "anotheruser",
        followers: [],
        following: [],
        lists: [],
        reviews: [],
      },
    ];

    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const req = createMockRequest("query=user");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.users).toEqual(mockUsers);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        username: {
          contains: "user",
          mode: "insensitive",
        },
      },
      take: 10,
      include: {
        followers: {
          select: { followerId: true },
        },
        following: true,
        lists: true,
        reviews: true,
      },
    });
  });
});
