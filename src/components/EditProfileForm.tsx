"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import countries from "world-countries";

interface EditProfileFormProps {
  user: {
    id: string;
    username: string;
    profilePic?: string | null;
    country?: string | null;
  };
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
  const [country, setCountry] = useState(user.country || "");
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [isClient, setIsClient] = useState(false); // 👈 NEW
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("country", country);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    await fetch(`/api/user/${user.username}/edit`, {
      method: "POST",
      body: formData,
    });

    router.push(`/user/${user.username}`);
    router.refresh();
  }

  const countryOptions = countries.map((c) => ({
    value: c.cca2,
    label: c.name.common,
    code: c.cca2,
  }));

  const defaultCountry = countryOptions.find((opt) => opt.value === country);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              option: (provided) => ({
                ...provided,
                padding: 10,
              }),
              control: (provided) => ({
                ...provided,
                padding: 4,
                borderRadius: "0.5rem",
              }),
            }}
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Profile Picture
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
          className="w-full border rounded-md p-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save Changes
      </button>
    </form>
  );
}
