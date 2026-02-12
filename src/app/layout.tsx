import type { Metadata } from "next";
import "./globals.css";
import { AuthSync } from "@/components/auth/auth-sync";

export const metadata: Metadata = {
  title: "Takunda",
  description: "Welcome to Takunda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AuthSync />
        {children}
      </body>
    </html>
  );
}
