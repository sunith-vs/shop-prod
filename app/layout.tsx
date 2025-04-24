import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import localFont from 'next/font/local'

import { RazorpayProvider } from "@/components/user/purchase/razorpay-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// Load Mona Sans as a local font
const monaSans = localFont({
  src: [
    {
      path: '../public/fonts/MonaSans-Italic-VariableFont_wdth,wght.ttf',
      weight: '200 900', // Variable font weight range
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-mona-sans', // Define CSS variable
})

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
        <RazorpayProvider>
          {children}
          <Toaster />
        </RazorpayProvider>
      </body>
    </html>
  );
}
