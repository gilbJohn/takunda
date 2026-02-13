import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 p-8">
      <h1 className="text-4xl font-bold text-slate-100">404</h1>
      <p className="text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </div>
  );
}
