"use client";

import Image from "next/image";

interface UserCountryProps {
  countryCode: string;
}

export default function UserCountry({ countryCode }: UserCountryProps) {
  if (!countryCode) return null;

  return (
    <span className="inline-flex items-center gap-1">
      <span className="relative w-5 h-3.5">
        <Image
          src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
          alt={`${countryCode} flag`}
          fill
          className="object-contain rounded-sm"
          sizes="20px"
        />
      </span>
      <span>{countryCode}</span>
    </span>
  );
}
