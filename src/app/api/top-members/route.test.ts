import { GET } from "./route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/users/top", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns top users sorted by followers count", async () => {
    const mockUsers = [
      {
        id: "u1",
        username: "mostfollowed",
        followers: [{ followerId: "u2" }, { followerId: "u3" }],
        following: [],
        lists: [],
        reviews: [],
      },
      {
        id: "u2",
        username: "lessfollowed",
        followers: [{ followerId: "u1" }],
        following: [],
        lists: [],
        reviews: [],
      },
    ];

    (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.users).toEqual(mockUsers);
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      take: 10,
      orderBy: {
        followers: {
          _count: "desc",
        },
      },
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
