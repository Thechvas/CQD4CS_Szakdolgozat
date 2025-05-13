import { getDbUserId, toggleFollow } from "../user.action";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

jest.mock("@auth/prisma-adapter");

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    follows: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("getDbUserId", () => {
  it("returns user ID if session exists", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });

    const result = await getDbUserId();
    expect(result).toBe("user123");
  });

  it("returns null if session or user ID is missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const result = await getDbUserId();
    expect(result).toBeNull();
  });
});

describe("toggleFollow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error if user is not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const result = await toggleFollow("target123");
    expect(result).toEqual({ success: false, error: "Not authenticated" });
  });

  it("returns error if user tries to follow themselves", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "sameId" },
    });

    const result = await toggleFollow("sameId");
    expect(result).toEqual({ success: false, error: "Error toggling follow" });
  });

  it("deletes existing follow if already following", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });
    (prisma.follows.findUnique as jest.Mock).mockResolvedValue({
      id: "existingFollow",
    });

    const result = await toggleFollow("target123");

    expect(prisma.follows.delete).toHaveBeenCalledWith({
      where: {
        followerId_followingId: {
          followerId: "user123",
          followingId: "target123",
        },
      },
    });
    expect(result).toEqual({ success: true });
  });

  it("creates new follow if not already following", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });
    (prisma.follows.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await toggleFollow("target123");

    expect(prisma.follows.create).toHaveBeenCalledWith({
      data: {
        followerId: "user123",
        followingId: "target123",
      },
    });
    expect(result).toEqual({ success: true });
  });

  it("returns error on unexpected failure", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: "user123" },
    });
    (prisma.follows.findUnique as jest.Mock).mockRejectedValue(
      new Error("DB error")
    );

    const result = await toggleFollow("target123");
    expect(result).toEqual({ success: false, error: "Error toggling follow" });
  });
});
