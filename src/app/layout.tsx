import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Game Catalogue',
  description: 'Discover and track your favorite video games',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        <header className="bg-white shadow p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">🎮 Game Catalogue</h1>
            <h2></h2>
          </div>
        </header>
        <main className="container mx-auto p-4">{children}</main>
        <footer className="bg-white border-t mt-8 p-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Game Catalogue. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
