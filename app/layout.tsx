import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { inter, monaSans } from "@/lib/fonts";
import { MainNav } from "@/components/main-nav";

export const metadata: Metadata = {
  title: "Course Management",
  description: "Manage your courses efficiently",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${monaSans.variable}`}>
      <body className={inter.className}>
        <MainNav />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
