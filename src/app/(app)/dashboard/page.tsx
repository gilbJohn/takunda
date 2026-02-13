"use client";

import Link from "next/link";
import { Users, BookOpen, User, UsersRound, Gamepad2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}!`}
        description="Here are some quick actions to get started."
      />
      <div className="grid auto-rows-fr gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/profile" className="group flex h-full">
          <Card className="h-full w-full min-h-[180px] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-500">
                <User className="h-6 w-6" />
              </div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>View and edit your profile and classes</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/friends" className="group flex h-full">
          <Card className="h-full w-full min-h-[180px] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-500">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Friends</CardTitle>
              <CardDescription>Connect with friends and classmates</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/study-groups" className="group flex h-full">
          <Card className="h-full w-full min-h-[180px] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-500">
                <UsersRound className="h-6 w-6" />
              </div>
              <CardTitle>Study Groups</CardTitle>
              <CardDescription>
                Join or create study groups with classmates
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/study" className="group flex h-full">
          <Card className="h-full w-full min-h-[180px] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-500">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle>Study</CardTitle>
              <CardDescription>Browse and study your flashcard decks</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/games" className="group flex h-full">
          <Card className="h-full w-full min-h-[180px] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600/15 text-emerald-500">
                <Gamepad2 className="h-6 w-6" />
              </div>
              <CardTitle>Games</CardTitle>
              <CardDescription>Play Jeopardy and other study games</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      <div className="mt-8 flex gap-4">
        <Link href="/study/create">
          <Button>Create a deck</Button>
        </Link>
      </div>
    </PageContainer>
  );
}
