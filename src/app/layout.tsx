import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthSync } from "@/components/auth/auth-sync";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

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
    <html lang="en" className={`${plusJakarta.variable} dark`}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        <AuthSync />
        {children}
      </body>
    </html>
  );
}
