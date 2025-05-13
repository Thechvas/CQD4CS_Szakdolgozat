import { POST } from "./route";
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
      update: jest.fn(),
    },
  },
}));

const mockSession = {
  user: {
    id: "user123",
    email: "test@example.com",
  },
};

const createFormRequest = (data: Record<string, string>) => {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }

  return {
    formData: async () => formData,
  } as unknown as NextRequest;
};

const createContext = (username: string) => ({
  params: Promise.resolve({ username }),
});

describe("POST /api/user/[username]/edit", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 401 if unauthenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = createFormRequest({});
    const res = await POST(req, createContext("oldname"));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 403 if user is not editing their own profile", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "other-user-id",
      username: "oldname",
    });

    const req = createFormRequest({});
    const res = await POST(req, createContext("oldname"));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("returns 409 if new username is taken", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: "user123", username: "oldname" })
      .mockResolvedValueOnce({ id: "conflict-id", username: "newname" });

    const req = createFormRequest({ username: "newname" });
    const res = await POST(req, createContext("oldname"));
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Username is already taken.");
  });

  it("updates user and returns success", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: "user123", username: "oldname" })
      .mockResolvedValueOnce(null);

    (prisma.user.update as jest.Mock).mockResolvedValue({});

    const req = createFormRequest({
      username: "newname",
      country: "USA",
      profilePicUrl: "/new-pic.png",
    });

    const res = await POST(req, createContext("oldname"));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user123" },
      data: {
        username: "newname",
        country: "USA",
        profilePic: "/new-pic.png",
      },
    });
  });

  it("returns 500 if update fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
      id: "user123",
      username: "oldname",
    });

    (prisma.user.update as jest.Mock).mockRejectedValue(new Error("DB error"));

    const req = createFormRequest({
      username: "oldname",
      country: "USA",
      profilePicUrl: "/pic.png",
    });

    const res = await POST(req, createContext("oldname"));
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
