"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center space-x-2 text-xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
            Takunda
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
