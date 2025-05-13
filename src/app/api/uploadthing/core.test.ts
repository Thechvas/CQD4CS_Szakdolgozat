import { ourFileRouter } from "./core";
import { getToken } from "next-auth/jwt";

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

describe("UploadThing File Router", () => {
  describe("auth()", () => {
    it("throws if no token is returned", async () => {
      (getToken as jest.Mock).mockResolvedValue(null);

      const req = new Request("http://localhost");

      await expect(
        ourFileRouter.imageUploader.middleware({ req })
      ).rejects.toThrow("Unauthorized");
    });

    it("returns userId if token is valid", async () => {
      (getToken as jest.Mock).mockResolvedValue({ sub: "user123" });

      const req = new Request("http://localhost");

      const result = await ourFileRouter.imageUploader.middleware({ req });

      expect(result).toEqual({ userId: "user123" });
    });
  });

  describe("onUploadComplete()", () => {
    it("logs and returns uploaded data", async () => {
      const metadata = { userId: "user123" };
      const file = { ufsUrl: "https://cdn.uploadthing.com/file.png" };

      const result = await ourFileRouter.imageUploader.onUploadComplete({
        metadata,
        file,
      });

      expect(result).toEqual({
        uploadedBy: "user123",
        url: "https://cdn.uploadthing.com/file.png",
      });
    });
  });
});
