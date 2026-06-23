import { Inter, Geist_Mono } from "next/font/google";

// Shared font instances. Previously initialized in the root layout; after the
// static-rendering refactor (step 130) the root layout is a bare pass-through and
// each zone layout ([lang], (reference), admin) owns its own <html>/<body>, so the
// font CSS variables are imported from here to avoid re-declaring the loaders.
export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Applied on <html>: font variables + base sizing/antialias (was root layout html className).
export const htmlFontClass = `${inter.variable} ${geistMono.variable} h-full antialiased`;
