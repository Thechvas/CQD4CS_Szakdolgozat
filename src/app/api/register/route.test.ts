import { prisma } from "@/lib/prisma";
import { POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn(() => Promise.resolve("hashedPassword")),
}));

describe("POST /api/register", () => {
  const mockRequest = (body: any): Request =>
    new Request("http://localhost/api/register", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

  it("returns 400 if request body is invalid JSON", async () => {
    const badReq = new Request("http://localhost/api/register", {
      method: "POST",
      body: "invalid-json",
    });

    const res = await POST(badReq);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Invalid request body");
  });

  it("returns 400 if missing required fields", async () => {
    const req = mockRequest({ username: "test" });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe("Missing fields");
  });

  it("returns 409 if email already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) =>
      where.email ? { id: 1 } : null
    );

    const req = mockRequest({
      username: "newuser",
      email: "existing@example.com",
      password: "password123",
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error).toBe("Email is already registered");
  });

  it("returns 409 if username already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(({ where }) =>
      where.username ? { id: 2 } : null
    );

    const req = mockRequest({
      username: "takenuser",
      email: "new@example.com",
      password: "password123",
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error).toBe("Username is already taken");
  });

  it("creates user and returns 201 on success", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.user.create as jest.Mock).mockResolvedValueOnce({
      id: 1,
      username: "newuser",
      email: "new@example.com",
    });

    const req = mockRequest({
      username: "newuser",
      email: "new@example.com",
      password: "password123",
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.user.username).toBe("newuser");
  });

  it("returns 500 on unexpected error", async () => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(() => {
      throw new Error("DB failure");
    });

    const req = mockRequest({
      username: "newuser",
      email: "new@example.com",
      password: "password123",
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe("Internal Server Error");
  });
});
