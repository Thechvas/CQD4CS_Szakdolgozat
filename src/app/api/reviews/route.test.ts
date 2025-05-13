import { POST } from "./route";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    review: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockSession = {
  user: {
    id: "user123",
    email: "test@example.com",
  },
};

const createMockRequest = (body: object): Request =>
  ({ json: async () => body } as unknown as Request);

describe("POST /api/reviews", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 401 if user is not authenticated", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({
      gameId: 1,
      text: "Great game!",
      rating: 9,
    });
    const res = await POST(req);
    const text = await res.text();

    expect(res.status).toBe(401);
    expect(text).toBe("Unauthorized");
  });

  it("returns 400 if review text is too long", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const req = createMockRequest({
      gameId: 1,
      text: "a".repeat(8001),
      rating: 8,
    });
    const res = await POST(req);
    const text = await res.text();

    expect(res.status).toBe(400);
    expect(text).toBe("Review text is too long (max 8000 characters)");
  });

  it("returns 400 if rating is invalid", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const req = createMockRequest({ gameId: 1, text: "Good", rating: 11 });
    const res = await POST(req);
    const text = await res.text();

    expect(res.status).toBe(400);
    expect(text).toBe("Invalid rating");
  });

  it("returns 409 if user already reviewed the game", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({ id: "r1" });

    const req = createMockRequest({
      gameId: 1,
      text: "Already reviewed",
      rating: 7,
    });
    const res = await POST(req);
    const text = await res.text();

    expect(res.status).toBe(409);
    expect(text).toBe("You already reviewed this game");
  });

  it("creates a new review and returns enriched data", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    (prisma.review.findUnique as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "r999",
        text: "Great!",
        rating: 9,
        _count: { likes: 2 },
        likes: [{ id: "like1" }],
        user: {
          username: "testuser",
          profilePic: "/pic.jpg",
        },
      });

    (prisma.review.create as jest.Mock).mockResolvedValue({ id: "r999" });

    const req = createMockRequest({ gameId: 1, text: "Great!", rating: 9 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.likeCount).toBe(2);
    expect(data.likedByUser).toBe(true);
    expect(data.user.username).toBe("testuser");
  });

  it("updates an existing review and returns enriched data", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    (prisma.review.update as jest.Mock).mockResolvedValue({ id: "rev123" });
    (prisma.review.findUnique as jest.Mock).mockResolvedValue({
      id: "rev123",
      text: "Updated",
      rating: 8,
      _count: { likes: 0 },
      likes: [],
      user: {
        username: "testuser",
        profilePic: "/pic.jpg",
      },
    });

    const req = createMockRequest({
      reviewId: "rev123",
      text: "Updated",
      rating: 8,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.text).toBe("Updated");
    expect(data.likedByUser).toBe(false);
  });

  it("returns 409 on Prisma unique constraint error (P2002)", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.review.create as jest.Mock).mockRejectedValue(
      new PrismaClientKnownRequestError("Unique constraint", {
        clientVersion: "4.0.0",
        code: "P2002",
      })
    );

    const req = createMockRequest({ gameId: 1, text: "Dup", rating: 5 });
    const res = await POST(req);
    const text = await res.text();

    expect(res.status).toBe(409);
    expect(text).toBe("Duplicate review not allowed");
  });

  it("returns 500 on unexpected error", async () => {
    const { getServerSession } = await import("next-auth");
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.review.create as jest.Mock).mockRejectedValue(
      new Error("Unexpected")
    );

    const req = createMockRequest({ gameId: 1, text: "Oops", rating: 5 });
    const res = await POST(req);
    const text = await res.text();

    expect(res.status).toBe(500);
    expect(text).toBe("Server error");
  });
});
