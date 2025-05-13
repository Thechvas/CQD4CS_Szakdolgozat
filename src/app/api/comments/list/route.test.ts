import { GET } from "./route";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    comment: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/comments", () => {
  const createRequest = (url: string): Request =>
    new Request(url, { method: "GET" });

  it("returns 400 if listId is missing", async () => {
    const req = createRequest("http://localhost/api/comments");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing listId");
  });

  it("returns comments if listId is provided", async () => {
    const mockComments = [
      {
        id: "comment1",
        text: "Hello",
        createdAt: "2023-01-01T00:00:00Z",
        user: { username: "testuser", profilePic: "/profile.png" },
      },
    ];

    (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);

    const req = createRequest("http://localhost/api/comments?listId=abc123");
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockComments);
    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { listId: "abc123" },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true, profilePic: true } },
      },
    });
  });

  it("handles prisma errors", async () => {
    (prisma.comment.findMany as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const req = createRequest("http://localhost/api/comments?listId=abc123");

    try {
      await GET(req);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe("DB error");
    }
  });
});
