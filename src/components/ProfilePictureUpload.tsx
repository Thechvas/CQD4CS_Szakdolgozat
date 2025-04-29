"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { UploadButton } from "@/lib/uploadthing";

interface ProfilePictureUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ProfilePictureUpload({
  value,
  onChange,
}: ProfilePictureUploadProps) {
  const [progress, setProgress] = useState(0);

  const handleRemove = () => {
    onChange("");
    toast("Profile picture removed");
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Profile Picture
      </label>

      {value ? (
        <div className="flex flex-col items-center space-y-2">
          <img
            src={value}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border shadow"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-500 text-sm hover:underline"
          >
            Remove Picture
          </button>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 bg-gray-50 hover:bg-gray-100 transition-all text-center">
          <UploadButton
            endpoint="imageUploader"
            onUploadProgress={(p) => setProgress(p)}
            appearance={{
              container: "uploadthing-hidden-input w-full flex justify-center",
              button: "bg-transparent p-0 border-none shadow-none w-full",
            }}
            content={{
              button: (
                <div className="flex flex-col items-center gap-1 cursor-pointer">
                  <span className="text-sm text-gray-700 font-medium">
                    Click to upload image
                  </span>
                </div>
              ),
            }}
            onClientUploadComplete={(res) => {
              const newUrl = res?.[0]?.ufsUrl;
              if (!newUrl) {
                toast.error("Upload failed.");
                return;
              }
              onChange(newUrl);
              setProgress(0);
              toast.success("Upload complete!");
            }}
            onUploadError={(error: Error) => {
              console.error("Upload error:", error.message);
              setProgress(0);
              toast.error("Upload failed.");
            }}
          />
          {progress > 0 && progress < 100 && (
            <div className="text-xs text-gray-500 mt-2 text-center">
              Uploading: {progress}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
