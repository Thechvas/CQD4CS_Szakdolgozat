import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Game Catalogue",
  description: "Discover and track your favorite video games",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <Navbar />
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}