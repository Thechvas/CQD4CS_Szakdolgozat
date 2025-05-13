import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    list: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const createMockRequest = (body: object): NextRequest =>
  ({
    json: async () => body,
  } as unknown as NextRequest);

const createMockContext = (listId: string) => ({
  params: Promise.resolve({ listId }),
});

const mockSession = {
  user: { id: "user123" },
};

describe("POST /api/list/[listId]/remove-game", () => {
  it("returns 401 if user is not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({ gameId: 1 });
    const res = await POST(req, createMockContext("list123"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if gameId is not a number", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const req = createMockRequest({ gameId: "abc" });
    const res = await POST(req, createMockContext("list123"));
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid game ID");
  });

  it("returns 403 if list does not exist or user does not own it", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({ gameId: 123 });
    const res = await POST(req, createMockContext("list123"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("removes the game from list and returns success", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      userId: "user123",
      gameIds: [101, 123, 202],
    });

    (prisma.list.update as jest.Mock).mockResolvedValue({});

    const req = createMockRequest({ gameId: 123 });
    const res = await POST(req, createMockContext("list123"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.list.update).toHaveBeenCalledWith({
      where: { id: "list123" },
      data: { gameIds: [101, 202] },
    });
  });
});
