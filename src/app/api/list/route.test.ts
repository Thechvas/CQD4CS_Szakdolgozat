import { GET, POST, DELETE } from "./route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    list: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const createMockRequest = (body: object): Request =>
  ({ json: async () => body } as unknown as Request);

const sessionWithEmail = { user: { email: "test@example.com", id: "user123" } };
const sessionWithId = { user: { id: "user123" } };

describe("GET /api/lists", () => {
  it("returns 401 if no session", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns user lists", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithEmail);
    (prisma.list.findMany as jest.Mock).mockResolvedValue([
      { id: "1", name: "List A" },
      { id: "2", name: "List B" },
    ]);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual([
      { id: "1", name: "List A" },
      { id: "2", name: "List B" },
    ]);
  });
});

describe("POST /api/lists", () => {
  it("returns 401 if not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ name: "New List", description: "desc" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if name is missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithId);
    const req = createMockRequest({ description: "desc" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing list name");
  });

  it("creates list and returns 201", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithId);
    const mockList = {
      id: "list123",
      name: "New List",
      description: "desc",
    };
    (prisma.list.create as jest.Mock).mockResolvedValue(mockList);

    const req = createMockRequest({ name: "New List", description: "desc" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data).toEqual(mockList);
  });

  it("returns 500 if creation fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithId);
    (prisma.list.create as jest.Mock).mockRejectedValue(new Error("Fail"));

    const req = createMockRequest({ name: "New List", description: "desc" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to create list");
  });
});

describe("DELETE /api/lists", () => {
  it("returns 401 if no session", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = createMockRequest({ listId: "list123" });
    const res = await DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 if listId is missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithId);
    const req = createMockRequest({});
    const res = await DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing listId");
  });

  it("returns 403 if user does not own the list", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithId);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      id: "list123",
      userId: "other-user",
    });

    const req = createMockRequest({ listId: "list123" });
    const res = await DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("deletes list and returns 200", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithId);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      id: "list123",
      userId: "user123",
    });
    (prisma.list.delete as jest.Mock).mockResolvedValue({});

    const req = createMockRequest({ listId: "list123" });
    const res = await DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it("returns 500 if delete fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(sessionWithId);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      id: "list123",
      userId: "user123",
    });
    (prisma.list.delete as jest.Mock).mockRejectedValue(
      new Error("delete fail")
    );

    const req = createMockRequest({ listId: "list123" });
    const res = await DELETE(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe("Failed to delete list");
  });
});
