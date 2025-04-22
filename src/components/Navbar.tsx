"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const categories = [
    { name: "RPG", href: "/category/rpg" },
    { name: "Shooter", href: "/category/shooter" },
    { name: "Indie", href: "/category/indie" },
    { name: "Strategy", href: "/category/strategy" },
  ];

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

          {/* Search Bar */}
          <div className="hidden md:block flex-grow mx-6">
            <input
              type="text"
              placeholder="Search games..."
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/popular" className="hover:text-indigo-400">
              Popular
            </Link>
            <Link href="/members" className="hover:text-indigo-400">
              Members
            </Link>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 hover:text-indigo-400"
              >
                <span>Categories</span>
                <ChevronDown size={16} />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-md shadow-lg z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={cat.href}
                      className="block px-4 py-2 hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Profile Dropdown */}
              {/* <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}>
                 <Image
                  src="/default_profile.jpg"
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full"
                /> 
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/logout"
                    className="block px-4 py-2 hover:bg-gray-700"
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div> */}
            </div>

            {/* Sign In / Create Account */}
            <Link href="/login" className="hover:text-indigo-400">
              Sign In
            </Link>

            <Link href="/join" className="hover:text-indigo-400">
              Create Account
            </Link>
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
          <input
            type="text"
            placeholder="Search games..."
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Link href="/popular" className="block py-2 hover:text-indigo-400">
            Popular
          </Link>
          <Link href="/members" className="block py-2 hover:text-indigo-400">
            Members
          </Link>

          {/* Mobile Dropdown */}
          <div>
            <span className="block py-2 font-semibold">Categories</span>
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="block pl-4 py-1 hover:text-indigo-400"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Profile Links
          <div>
            <Link href="/profile" className="block py-2 hover:text-indigo-400">
              Profile
            </Link>
            <Link href="/settings" className="block py-2 hover:text-indigo-400">
              Settings
            </Link>
            <Link href="/logout" className="block py-2 hover:text-indigo-400">
              Logout
            </Link>
          </div> */}

          {/* Sign In / Create Account */}
          <Link href="/login" className="block py-2 hover:text-indigo-400">
            Sign In
          </Link>
          {/* Sign In / Create Account */}
          <Link href="/join" className="block py-2 hover:text-indigo-400">
            Create Account
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
