import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: "/api/uploadthing",
});

export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: "/api/uploadthing",
});
