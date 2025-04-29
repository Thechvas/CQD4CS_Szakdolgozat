import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/faker-js/assets-person-portrait/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/w40/**",
      },
      {
        protocol: "https",
        hostname: "images.igdb.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "fnaksp40wy.ufs.sh",
        pathname: "/f/**",
      },
    ],
  },
};

export default nextConfig;
