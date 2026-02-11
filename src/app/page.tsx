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
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="flex-1">
        <div className="flex flex-col">
          <section className="container flex flex-col items-center gap-8 py-24 md:py-32">
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl md:text-6xl">
                Study smarter, together
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                Takunda combines flashcards, social discovery, and study tools to
                help you learn faster and connect with classmates.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="text-base">
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-base">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="container py-24">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Everything you need to study
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Layers className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <CardTitle>Flashcards</CardTitle>
                    <CardDescription>
                      Create and study flashcard decks. Flip, swipe, and master your
                      material.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <CardTitle>Social</CardTitle>
                    <CardDescription>
                      Find classmates by shared courses. See who&apos;s in your
                      classes and connect.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                      <BookOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <CardTitle>Study Together</CardTitle>
                    <CardDescription>
                      Organize by class and share decks. Study the way that works for
                      you.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          <section className="container border-t border-gray-200 py-24 dark:border-gray-800">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                Ready to get started?
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Join Takunda today and level up your study game.
              </p>
              <div className="mt-8">
                <Link href="/signup">
                  <Button size="lg">Sign Up Free</Button>
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
