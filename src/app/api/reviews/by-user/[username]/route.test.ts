import { GET } from "./route";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    review: {
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

const mockReviews = [
  {
    id: "r1",
    content: "Review 1",
    _count: { likes: 5 },
    likes: [{ id: "like1" }],
    user: {
      username: "testuser",
      profilePic: "/pic.jpg",
    },
  },
  {
    id: "r2",
    content: "Review 2",
    _count: { likes: 2 },
    likes: [],
    user: {
      username: "testuser",
      profilePic: "/pic.jpg",
    },
  },
];

describe("GET /api/user/[username]/reviews", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 404 if user not found", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest("http://localhost/api/user/unknown/reviews");
    const res = await GET(req, createMockContext("unknown"));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("User not found");
  });

  it("returns paginated reviews without like info if unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user123" });
    (prisma.review.count as jest.Mock).mockResolvedValue(2);
    (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

    const req = createMockRequest(
      "http://localhost/api/user/testuser/reviews?page=1&perPage=2"
    );
    const res = await GET(req, createMockContext("testuser"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.total).toBe(2);
    expect(data.reviews[0]).toMatchObject({
      id: "r1",
      likeCount: 5,
      likedByUser: false,
    });
    expect(data.reviews[1]).toMatchObject({
      id: "r2",
      likeCount: 2,
      likedByUser: false,
    });
  });

  it("returns paginated reviews with likedByUser=true for authenticated user", async () => {
    const session = { user: { id: "user123" } };

    (getServerSession as jest.Mock).mockResolvedValue(session);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "user123" });
    (prisma.review.count as jest.Mock).mockResolvedValue(2);
    (prisma.review.findMany as jest.Mock).mockResolvedValue(mockReviews);

    const req = createMockRequest("http://localhost/api/user/testuser/reviews");
    const res = await GET(req, createMockContext("testuser"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.reviews.length).toBe(2);
    expect(data.reviews[0].likedByUser).toBe(true);
    expect(data.reviews[1].likedByUser).toBe(false);
  });
});
