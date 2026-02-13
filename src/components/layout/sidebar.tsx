"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Handshake,
  GraduationCap,
  BookOpen,
  Trophy,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserCircle },
  { href: "/friends", label: "Friends", icon: Handshake },
  { href: "/study-groups", label: "Study Groups", icon: GraduationCap },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/games", label: "Games", icon: Trophy },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen = false, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const closeMobile = () => onMobileOpenChange?.(false);

  const navContent = (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
        <Link
          href="/dashboard"
          onClick={closeMobile}
          className="text-xl font-bold tracking-tight"
        >
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
            Takunda
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={closeMobile}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={closeMobile}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start rounded-xl",
                  isActive && "bg-emerald-600/15 text-emerald-500"
                )}
              >
                <Icon className="mr-3 h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-slate-800 p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar src={user?.avatar} fallback={user?.name} className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-slate-100">
              {user?.name ?? "User"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.email ?? ""}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4 shrink-0" />
          Log out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 backdrop-blur-sm transition-transform duration-200 ease-out lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
