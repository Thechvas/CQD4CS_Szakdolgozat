import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { DELETE, POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    comment: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

const mockSession = {
  user: { id: "user1" },
};

const createRequest = (
  method: string,
  body?: object,
  url?: string
): Request => {
  return new Request(url ?? "http://localhost/api/comments", {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
};

describe("POST /api/comments", () => {
  it("returns 401 if not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await POST(createRequest("POST", { text: "hi", listId: "1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 if required fields are missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const res = await POST(createRequest("POST", { text: "" }));
    expect(res.status).toBe(400);
  });

  it("creates a comment and returns 200", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.comment.create as jest.Mock).mockResolvedValue({
      id: "123",
      text: "Test comment",
      user: { username: "tester", profilePic: "/pic.png" },
    });

    const res = await POST(
      createRequest("POST", { text: "Test comment", listId: "1" })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.text).toBe("Test comment");
    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: {
        text: "Test comment",
        listId: "1",
        userId: "user1",
      },
      include: {
        user: { select: { username: true, profilePic: true } },
      },
    });
  });
});

describe("DELETE /api/comments", () => {
  it("returns 401 if not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await DELETE(
      new Request("http://localhost/api/comments?id=123")
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 if comment ID is missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    const res = await DELETE(new Request("http://localhost/api/comments"));
    expect(res.status).toBe(400);
  });

  it("returns 403 if user does not own the comment", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
      id: "123",
      userId: "otherUser",
    });

    const res = await DELETE(
      new Request("http://localhost/api/comments?id=123")
    );
    expect(res.status).toBe(403);
  });

  it("deletes comment and returns success", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
      id: "123",
      userId: "user1",
    });

    const res = await DELETE(
      new Request("http://localhost/api/comments?id=123")
    );
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.comment.delete).toHaveBeenCalledWith({
      where: { id: "123" },
    });
  });
});
