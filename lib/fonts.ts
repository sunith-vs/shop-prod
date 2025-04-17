import { Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const monaSans = localFont({
  src: [
    {
      path: "../public/fonts/MonaSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "../public/fonts/MonaSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-mona-sans",
  display: "swap",
});
