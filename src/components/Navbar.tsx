"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import GameSearch from "./GameSearch";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();

  const discover = [
    { name: "Popular", href: "/popular" },
    { name: "Top Rated", href: "/top-rated" },
    { name: "Recently Released", href: "/recently-released" },
  ];

  const username = session?.user?.username;

  return (
    <nav className="bg-gray-900 text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              GameVault
            </Link>
          </div>

          <div className="hidden md:block flex-grow mx-6">
            <GameSearch />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 hover:text-indigo-400"
              >
                <span>Discover</span>
                <ChevronDown size={16} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-50">
                  {discover.map((d) => (
                    <Link
                      key={d.name}
                      href={d.href}
                      className="block px-4 py-2 hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {d.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/members" className="hover:text-indigo-400">
              Members
            </Link>

            {session?.user ? (
              <>
                <Link
                  href={`/user/${username}`}
                  className="hover:text-indigo-400"
                >
                  {username || "Profile"}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hover:text-indigo-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => signIn()}
                  className="hover:text-indigo-400"
                >
                  Sign In
                </button>
                <Link href="/join" className="hover:text-indigo-400">
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-4">
          <GameSearch />

          <div>
            <span className="block py-2 font-semibold">Discover</span>
            {discover.map((d) => (
              <Link
                key={d.name}
                href={d.href}
                className="block pl-4 py-1 hover:text-indigo-400"
              >
                {d.name}
              </Link>
            ))}
          </div>

          <Link href="/members" className="block py-2 hover:text-indigo-400">
            Members
          </Link>

          {session?.user ? (
            <>
              <Link
                href={`/user/${username}`}
                className="block py-2 hover:text-indigo-400"
              >
                {username || "Profile"}
              </Link>
              <button
                onClick={() => signOut()}
                className="block py-2 text-left w-full hover:text-indigo-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => signIn()}
                className="block py-2 text-left w-full hover:text-indigo-400"
              >
                Sign In
              </button>
              <Link href="/join" className="block py-2 hover:text-indigo-400">
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
