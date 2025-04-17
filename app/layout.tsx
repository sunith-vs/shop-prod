import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { inter, monaSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";

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
    <html lang="en" className={cn(inter.variable, monaSans.variable)}>
      <body className={cn("antialiased", inter.className)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
