import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Footer } from "@/components/layout/footer";
import { Layers, Users, BookOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <MarketingNav />
      <main className="flex-1">
        <div className="flex flex-col">
          <section className="container flex flex-col items-center gap-10 py-20 sm:py-28 md:py-36">
            <div className="mx-auto max-w-3xl space-y-8 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl">
                Study smarter,{" "}
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">
                  together
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-400 sm:text-xl">
                Flashcards, friends, and games. Learn faster and actually enjoy it.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get started free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="container py-20 sm:py-28">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-14 text-center text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
                Everything you need to study
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-500">
                      <Layers className="h-7 w-7" />
                    </div>
                    <CardTitle>Flashcards</CardTitle>
                    <CardDescription>
                      Create and study decks. Flip, swipe, and actually remember it.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-500">
                      <Users className="h-7 w-7" />
                    </div>
                    <CardTitle>Social</CardTitle>
                    <CardDescription>
                      Find classmates by shared courses. See who&apos;s in your classes.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600/15 text-emerald-500">
                      <BookOpen className="h-7 w-7" />
                    </div>
                    <CardTitle>Study Together</CardTitle>
                    <CardDescription>
                      Organize by class, share decks, and study the way that works.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          <section className="container border-t border-slate-800 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
                Ready to level up?
              </h2>
              <p className="mt-4 text-slate-400">
                Join Takunda and make studying actually enjoyable.
              </p>
              <div className="mt-8">
                <Link href="/signup">
                  <Button size="lg">Get started free</Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
