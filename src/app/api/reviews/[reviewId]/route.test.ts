import { DELETE } from "./route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    like: {
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const createMockContext = (reviewId: string) => ({
  params: Promise.resolve({ reviewId }),
});

const mockSession = { user: { id: "user123" } };

describe("DELETE /api/review/[reviewId]", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 401 if unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const res = await DELETE({} as Request, createMockContext("r1"));
    const text = await res.text();

    expect(res.status).toBe(401);
    expect(text).toBe("Unauthorized");
  });

  it("returns 404 if review not found", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await DELETE({} as Request, createMockContext("r2"));
    const text = await res.text();

    expect(res.status).toBe(404);
    expect(text).toBe("Not Found");
  });

  it("returns 403 if user is not the author", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      userId: "anotherUser",
    });

    const res = await DELETE({} as Request, createMockContext("r3"));
    const text = await res.text();

    expect(res.status).toBe(403);
    expect(text).toBe("Forbidden");
  });

  it("deletes review and its likes if user is author", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      userId: "user123",
    });
    (prisma.like.deleteMany as jest.Mock).mockResolvedValue({});
    (prisma.review.delete as jest.Mock).mockResolvedValue({});

    const res = await DELETE({} as Request, createMockContext("r4"));
    const text = await res.text();

    expect(prisma.like.deleteMany).toHaveBeenCalledWith({
      where: { reviewId: "r4" },
    });
    expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: "r4" } });
    expect(res.status).toBe(200);
    expect(text).toBe("Deleted");
  });
});
