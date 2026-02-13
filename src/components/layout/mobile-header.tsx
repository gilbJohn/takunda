"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 lg:hidden">
      <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </Button>
      <Link
        href="/dashboard"
        className="text-lg font-bold tracking-tight"
      >
        <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
          Takunda
        </span>
      </Link>
      <div className="w-10" />
    </header>
  );
}
