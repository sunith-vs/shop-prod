import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const monaSans = localFont({
  src: [
    {
      path: "../public/fonts/Mona-Sans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Mona-Sans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Mona-Sans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mona-sans",
});
