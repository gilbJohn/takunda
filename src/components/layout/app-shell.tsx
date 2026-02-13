"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />
      <div className="flex min-h-screen flex-1 flex-col">
        <MobileHeader onMenuClick={() => setMobileOpen(true)} />
        <main className="min-h-screen flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
