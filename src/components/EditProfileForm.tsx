"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // 🆕 Import useSession
import Select from "react-select";
import countries from "world-countries";
import toast from "react-hot-toast";
import ProfilePictureUpload from "./ProfilePictureUpload";

interface EditProfileFormProps {
  user: {
    id: string;
    username: string;
    profilePic?: string | null;
    country?: string | null;
  };
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [username, setUsername] = useState(user.username || "");
  const [usernameError, setUsernameError] = useState("");
  const [country, setCountry] = useState(user.country || "");
  const [profilePicUrl, setProfilePicUrl] = useState(user.profilePic || "");
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();
  const { update } = useSession(); // 🆕 get update function

  useEffect(() => setIsClient(true), []);

  const validateUsername = (name: string) => {
    if (name.length < 4) return "Username must be at least 4 characters.";
    if (name.length > 20) return "Username must be no more than 20 characters.";
    return "";
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validation = validateUsername(username);
    setUsernameError(validation);
    if (validation) return;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("country", country);
    formData.append("profilePicUrl", profilePicUrl);

    const result = await fetch(`/api/user/${user.username}/edit`, {
      method: "POST",
      body: formData,
    });

    if (result.ok) {
      toast.success("Profile updated!");
      await update(); // 🆕 Refresh session after successful profile update
      router.push(`/user/${username}`);
      router.refresh();
    } else if (result.status === 409) {
      const data = await result.json();
      setUsernameError(data.error || "This username is already taken.");
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  }

  const countryOptions = countries.map((c) => ({
    value: c.cca2,
    label: c.name.common,
    code: c.cca2,
  }));

  const defaultCountry = countryOptions.find((opt) => opt.value === country);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameError(
              e.target.value ? validateUsername(e.target.value) : ""
            );
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter new username"
          required
        />
        {usernameError && (
          <p className="text-sm text-red-500 mt-1">{usernameError}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Country</label>
        {isClient && (
          <Select
            options={countryOptions}
            value={defaultCountry}
            onChange={(option) => setCountry(option?.value || "")}
            placeholder="Select your country"
            isSearchable
            formatOptionLabel={(option: any) => (
              <div className="flex items-center gap-2">
                <img
                  src={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png`}
                  alt={option.label}
                  className="w-5 h-3 rounded-sm object-cover"
                />
                <span>{option.label}</span>
              </div>
            )}
            styles={{
              option: (provided) => ({ ...provided, padding: 10 }),
              control: (provided) => ({
                ...provided,
                padding: 4,
                borderRadius: "0.5rem",
              }),
            }}
          />
        )}
      </div>

      <div className="space-y-4">
        <ProfilePictureUpload
          value={profilePicUrl}
          onChange={setProfilePicUrl}
        />
      </div>

      <div className="flex justify-center pt-6">
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 shadow"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
