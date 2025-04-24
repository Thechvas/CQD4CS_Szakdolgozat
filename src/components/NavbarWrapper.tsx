"use client";

import Navbar from "./Navbar";
import { SessionProvider } from "next-auth/react";

export default function NavbarWrapper() {
  return (
    <SessionProvider>
      <Navbar />
    </SessionProvider>
  );
}
