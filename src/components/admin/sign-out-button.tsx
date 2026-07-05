"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full text-white/50 text-xs hover:text-white transition text-left mt-2"
    >
      Sign out
    </button>
  );
}