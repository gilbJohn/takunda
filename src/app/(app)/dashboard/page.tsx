"use client";

import Link from "next/link";
import { Users, BookOpen, User } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="container max-w-4xl space-y-8 p-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}!`}
        description="Here are some quick actions to get started."
      />
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/find">
          <Card className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle>Find classmates</CardTitle>
              <CardDescription>
                Search for students in your classes
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/study">
          <Card className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <BookOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle>Study</CardTitle>
              <CardDescription>
                Browse and study your flashcard decks
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/profile">
          <Card className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                View and edit your profile
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      <div className="flex gap-4">
        <Link href="/study/create">
          <Button>Create a deck</Button>
        </Link>
      </div>
    </div>
  );
}
