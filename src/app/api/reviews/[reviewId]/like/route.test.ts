import { POST, GET } from "./route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    like: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Helpers
const createMockContext = (reviewId: string) => ({
  params: Promise.resolve({ reviewId }),
});

const mockSession = { user: { id: "user123" } };

describe("POST /api/review/[reviewId]/like", () => {
  it("returns 401 if unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const res = await POST({} as Request, createMockContext("rev1"));
    const text = await res.text();

    expect(res.status).toBe(401);
    expect(text).toBe("Unauthorized");
  });

  it("removes existing like and returns updated count", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.like.findUnique as jest.Mock).mockResolvedValue({
      id: "like123",
    });
    (prisma.like.count as jest.Mock).mockResolvedValue(2);

    const res = await POST({} as Request, createMockContext("rev1"));
    const data = await res.json();

    expect(prisma.like.delete).toHaveBeenCalledWith({
      where: { id: "like123" },
    });
    expect(data.liked).toBe(false);
    expect(data.likeCount).toBe(2);
  });

  it("creates new like and returns updated count", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.like.count as jest.Mock).mockResolvedValue(5);

    const res = await POST({} as Request, createMockContext("rev2"));
    const data = await res.json();

    expect(prisma.like.create).toHaveBeenCalledWith({
      data: {
        userId: "user123",
        reviewId: "rev2",
      },
    });
    expect(data.liked).toBe(true);
    expect(data.likeCount).toBe(5);
  });
});

describe("GET /api/review/[reviewId]/like", () => {
  it("returns like count and likedByUser = false for unauthenticated user", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    (prisma.like.count as jest.Mock).mockResolvedValue(3);

    const res = await GET({} as Request, createMockContext("rev3"));
    const data = await res.json();

    expect(data.likedByUser).toBe(false);
    expect(data.likeCount).toBe(3);
  });

  it("returns like count and likedByUser = true for authenticated user", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.like.count as jest.Mock).mockResolvedValue(10);
    (prisma.like.findUnique as jest.Mock).mockResolvedValue({
      id: "like456",
    });

    const res = await GET({} as Request, createMockContext("rev4"));
    const data = await res.json();

    expect(data.likedByUser).toBe(true);
    expect(data.likeCount).toBe(10);
  });

  it("returns likedByUser = false if no like found", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.like.count as jest.Mock).mockResolvedValue(0);
    (prisma.like.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await GET({} as Request, createMockContext("rev5"));
    const data = await res.json();

    expect(data.likedByUser).toBe(false);
    expect(data.likeCount).toBe(0);
  });
});
