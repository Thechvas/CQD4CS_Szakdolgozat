import { PUT } from "./route";
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

const mockSession = {
  user: { id: "user123" },
};

const createMockRequest = (body: object): Request =>
  ({
    json: async () => body,
  } as unknown as Request);

const createMockContext = (listId: string) => ({
  params: Promise.resolve({ listId }),
});

describe("PUT /api/list/[listId]", () => {
  it("returns 401 if not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createMockRequest({ name: "New Name", description: "Desc" });
    const res = await PUT(req, createMockContext("list123"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 if list does not exist or user is not owner", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      id: "list123",
      userId: "other-user",
    });

    const req = createMockRequest({ name: "New Name", description: "Desc" });
    const res = await PUT(req, createMockContext("list123"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("updates list and returns updated data", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.list.findUnique as jest.Mock).mockResolvedValue({
      id: "list123",
      userId: "user123",
    });

    const updatedList = {
      id: "list123",
      name: "Updated Name",
      description: "Updated Description",
    };

    (prisma.list.update as jest.Mock).mockResolvedValue(updatedList);

    const req = createMockRequest({
      name: "Updated Name",
      description: "Updated Description",
    });
    const res = await PUT(req, createMockContext("list123"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(updatedList);
    expect(prisma.list.update).toHaveBeenCalledWith({
      where: { id: "list123" },
      data: {
        name: "Updated Name",
        description: "Updated Description",
      },
    });
  });
});
