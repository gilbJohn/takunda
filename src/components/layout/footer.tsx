import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:py-10 md:flex-row">
        <p className="text-sm text-slate-400">
          Study smarter, together.
        </p>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up free</Button>
          </Link>
        </div>
      </div>
    </footer>
  );
}
