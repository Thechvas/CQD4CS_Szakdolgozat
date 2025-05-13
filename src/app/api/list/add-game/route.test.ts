import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

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

const createMockRequest = (body: object): Request =>
  ({
    json: async () => body,
  } as unknown as Request);

describe("POST /api/list/add-game", () => {
  const mockSession = { user: { email: "test@example.com" } };

  it("returns 401 if user is not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({ listId: "list1", gameId: 123 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if data is invalid", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);

    const req = createMockRequest({ listId: "list1", gameId: "abc" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid data");
  });

  it("returns 404 if list is not found", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({ listId: "list1", gameId: 123 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("List not found");
  });

  it("returns 409 if game is already in the list", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      gameIds: [123, 456],
    });

    const req = createMockRequest({ listId: "list1", gameId: 123 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Game already in list");
  });

  it("adds the game to the list and returns 200", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      gameIds: [456],
    });
    (prisma.list.update as jest.Mock).mockResolvedValue({});

    const req = createMockRequest({ listId: "list1", gameId: 123 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Game added to list");
    expect(prisma.list.update).toHaveBeenCalledWith({
      where: { id: "list1" },
      data: {
        gameIds: {
          push: 123,
        },
      },
    });
  });

  it("returns 500 if prisma update fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      gameIds: [],
    });
    (prisma.list.update as jest.Mock).mockRejectedValue(new Error("DB error"));

    const req = createMockRequest({ listId: "list1", gameId: 123 });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Database update failed");
  });
});
