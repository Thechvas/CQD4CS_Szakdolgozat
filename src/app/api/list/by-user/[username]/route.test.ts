import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    list: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const createMockRequest = (url: string): NextRequest =>
  ({
    url,
    nextUrl: new URL(url),
    method: "GET",
  } as unknown as NextRequest);

const createMockContext = (username: string) => ({
  params: Promise.resolve({ username }),
});

describe("GET /api/user/[username]/lists", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 404 if user is not found", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest(
      "http://localhost/api/user/testuser/lists?page=1&perPage=3"
    );
    const res = await GET(req, createMockContext("testuser"));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("returns paginated lists for a valid user", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user123",
    });

    (prisma.list.count as jest.Mock).mockResolvedValue(5);

    const mockLists = [
      { id: "list1", title: "List One", comments: [] },
      { id: "list2", title: "List Two", comments: [] },
    ];

    (prisma.list.findMany as jest.Mock).mockResolvedValue(mockLists);

    const req = createMockRequest(
      "http://localhost/api/user/testuser/lists?page=1&perPage=2"
    );
    const res = await GET(req, createMockContext("testuser"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.lists).toEqual(mockLists);
    expect(data.total).toBe(5);
    expect(prisma.list.findMany).toHaveBeenCalledWith({
      where: { userId: "user123" },
      orderBy: { createdAt: "desc" },
      skip: 0,
      take: 2,
      include: { comments: true },
    });
  });

  it("defaults to page=1 and perPage=3 if not provided", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user123" });
    (prisma.list.count as jest.Mock).mockResolvedValue(2);
    (prisma.list.findMany as jest.Mock).mockResolvedValue([]);

    const req = createMockRequest("http://localhost/api/user/testuser/lists");
    const res = await GET(req, createMockContext("testuser"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.lists).toEqual([]);
    expect(data.total).toBe(2);
    expect(prisma.list.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 3 })
    );
  });
});
