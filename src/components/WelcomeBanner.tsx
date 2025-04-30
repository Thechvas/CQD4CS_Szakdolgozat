"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

const WelcomeBanner = () => {
  const { data: session } = useSession();
  const username = session?.user?.username;

  return (
    <section className="text-center mb-16">
      <h1 className="text-5xl font-extrabold mb-4 text-gray-900">
        {username ? `Welcome back, ${username}!` : "Welcome to GameVault!"}
      </h1>
      <p className="text-lg text-gray-700 max-w-2xl mx-auto">
        Explore the gaming world, create custom lists, write reviews and rate
        your favorite games. Join a vibrant community of gamers just like you.
      </p>
      {!session?.user && (
        <Link
          href="/join"
          className="mt-6 inline-block bg-indigo-600 text-white text-lg font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition"
        >
          Sign up for free
        </Link>
      )}
    </section>
  );
};

export default WelcomeBanner;
